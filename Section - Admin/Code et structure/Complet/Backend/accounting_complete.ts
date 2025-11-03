// apps/api/src/modules/admin/services/accounting.service.ts

import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Controller, Get, Post, Param, Query, Body, Req, Res, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { PrismaService } from '../../database/prisma.service';
import { S3Service } from '../../storage/s3.service';
import { ModerationGateway } from '../gateways/moderation.gateway';
import { randomUUID } from 'crypto';
import * as PDFDocument from 'pdfkit';
import { Parser } from 'json2csv';
import * as XLSX from 'xlsx';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { AdminRoleGuard } from '../guards/admin-role.guard';
import { RateLimitGuard } from '../../../common/guards/rate-limit.guard';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe';
import { z } from 'zod';

interface GetAccountingSummaryDto {
  period: 'day' | 'week' | 'month' | 'year';
  year: number;
  month?: number;
}

interface ExportAccountingDto {
  type: 'accounting' | 'transactions' | 'payouts';
  format: 'csv' | 'pdf' | 'xlsx';
  dateFrom: string;
  dateTo: string;
}

@Injectable()
export class AccountingService {
  private readonly logger = new Logger(AccountingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly s3: S3Service,
    private readonly moderationGateway: ModerationGateway,
  ) {}

  async getSummary(query: GetAccountingSummaryDto) {
    try {
      const { period, year, month } = query;
      const dateRange = this.calculateDateRange(period, year, month);

      const [revenue, fees, payouts, operatingCosts] = await Promise.all([
        this.calculateRevenue(dateRange),
        this.calculateFees(dateRange),
        this.calculatePayouts(dateRange),
        this.calculateOperatingCosts(dateRange),
      ]);

      const platformTakeRate = 0.15;
      const commission = Math.round(revenue * platformTakeRate);
      const netProfit = revenue - fees - commission - operatingCosts;

      const breakdown = await this.getRevenueBreakdown(dateRange);

      this.logger.log(`Generated accounting summary for ${period} ${year}${month ? `-${month}` : ''}`);

      return {
        revenue,
        fees,
        commission,
        netProfit,
        breakdown,
        period,
        year,
        month,
        dateRange: {
          start: dateRange.start.toISOString(),
          end: dateRange.end.toISOString(),
        },
      };
    } catch (error) {
      this.logger.error('Error generating accounting summary', error);
      throw error;
    }
  }

  async exportData(dto: ExportAccountingDto, adminId: string) {
    try {
      const exportId = randomUUID();

      const exportRecord = await this.prisma.exportHistory.create({
        data: {
          id: exportId,
          type: dto.type,
          format: dto.format,
          initiatedById: adminId,
          status: 'PROCESSING',
          filters: dto,
        },
      });

      this.processExport(exportRecord, adminId).catch((error) => {
        this.logger.error('Export processing failed', error);
      });

      this.logger.log(`Export ${exportId} initiated by admin ${adminId}`);

      return { exportId, status: 'PROCESSING' };
    } catch (error) {
      this.logger.error('Error initiating export', error);
      throw error;
    }
  }

  async getExportHistory(cursor?: string, limit: number = 50) {
    try {
      const exports = await this.prisma.exportHistory.findMany({
        where: {
          status: { in: ['PROCESSING', 'COMPLETED'] },
          expiresAt: { gt: new Date() },
        },
        take: limit + 1,
        ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
        orderBy: { createdAt: 'desc' },
        include: {
          initiatedBy: {
            select: {
              id: true,
              username: true,
              email: true,
              avatar: true,
            },
          },
        },
      });

      const hasMore = exports.length > limit;
      const items = hasMore ? exports.slice(0, -1) : exports;
      const nextCursor = hasMore ? items[items.length - 1].id : null;

      return { items, nextCursor, hasMore };
    } catch (error) {
      this.logger.error('Error fetching export history', error);
      throw error;
    }
  }

  async getExportById(exportId: string) {
    try {
      const exportRecord = await this.prisma.exportHistory.findUnique({
        where: { id: exportId },
        include: {
          initiatedBy: {
            select: {
              username: true,
              email: true,
            },
          },
        },
      });

      if (!exportRecord) {
        throw new NotFoundException('Export not found');
      }

      if (!exportRecord.fileUrl) {
        throw new NotFoundException('Export file not available yet');
      }

      return exportRecord;
    } catch (error) {
      this.logger.error('Error fetching export', error);
      throw error;
    }
  }

  private async processExport(exportRecord: any, adminId: string) {
    try {
      this.logger.log(`Processing export ${exportRecord.id} - Type: ${exportRecord.type}, Format: ${exportRecord.format}`);

      let data: any;
      
      if (exportRecord.type === 'accounting') {
        data = await this.getAccountingData(exportRecord.filters);
      } else if (exportRecord.type === 'transactions') {
        data = await this.getTransactionsData(exportRecord.filters);
      } else if (exportRecord.type === 'payouts') {
        data = await this.getPayoutsData(exportRecord.filters);
      }

      let fileBuffer: Buffer;
      let contentType: string;

      if (exportRecord.format === 'csv') {
        fileBuffer = await this.generateCSV(data);
        contentType = 'text/csv';
      } else if (exportRecord.format === 'pdf') {
        fileBuffer = await this.generatePDF(data, exportRecord.type);
        contentType = 'application/pdf';
      } else if (exportRecord.format === 'xlsx') {
        fileBuffer = await this.generateXLSX(data);
        contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      } else {
        throw new Error('Invalid format');
      }

      const fileKey = `exports/${exportRecord.id}.${exportRecord.format}`;
      await this.s3.upload(fileKey, fileBuffer, contentType);

      const fileUrl = await this.s3.getSignedUrl(fileKey, 7 * 24 * 60 * 60);

      const rowCount = data.items?.length || 0;

      await this.prisma.exportHistory.update({
        where: { id: exportRecord.id },
        data: {
          status: 'COMPLETED',
          fileUrl,
          fileKey,
          fileSize: fileBuffer.length,
          rowCount,
          completedAt: new Date(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      this.moderationGateway.emitExportComplete(exportRecord.id, adminId, {
        type: exportRecord.type,
        format: exportRecord.format,
        fileUrl,
        fileSize: fileBuffer.length,
        rowCount,
      });

      this.logger.log(`Export ${exportRecord.id} completed successfully`);
    } catch (error) {
      this.logger.error(`Export ${exportRecord.id} failed`, error);

      await this.prisma.exportHistory.update({
        where: { id: exportRecord.id },
        data: {
          status: 'FAILED',
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
        },
      });
    }
  }

  private async generatePDF(data: any, type: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        const chunks: Buffer[] = [];

        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        doc.fontSize(24).text('Oliver Platform', { align: 'center' });
        doc.moveDown(0.5);
        doc.fontSize(16).text(`${type.toUpperCase()} Report`, { align: 'center' });
        doc.moveDown(0.5);
        doc.fontSize(10).text(`Generated: ${new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })}`, { align: 'center' });
        
        doc.moveDown(2);
        doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown(1);

        if (data.summary) {
          doc.fontSize(14).text('Financial Summary', { underline: true });
          doc.moveDown(0.5);

          const summaryEntries = Object.entries(data.summary);
          summaryEntries.forEach(([key, value]: [string, any]) => {
            const label = key.split(/(?=[A-Z])/).join(' ').replace(/^\w/, (c) => c.toUpperCase());
            const amount = typeof value === 'number' ? `€${(value / 100).toFixed(2)}` : value;
            
            doc.fontSize(10).text(`${label}:`, 70, doc.y, { continued: true });
            doc.text(amount, 300, doc.y);
            doc.moveDown(0.5);
          });
        }

        if (data.items && data.items.length > 0) {
          doc.moveDown(1);
          doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
          doc.moveDown(1);

          doc.fontSize(14).text('Detailed Records', { underline: true });
          doc.moveDown(0.5);

          const headers = Object.keys(data.items[0]);
          const colWidth = 500 / headers.length;

          doc.fontSize(9);
          headers.forEach((header, i) => {
            doc.text(
              header.replace(/([A-Z])/g, ' $1').trim(),
              70 + (i * colWidth),
              doc.y,
              { width: colWidth, continued: i < headers.length - 1 }
            );
          });
          doc.moveDown(0.5);
          doc.moveTo(70, doc.y).lineTo(570, doc.y).stroke();
          doc.moveDown(0.5);

          data.items.slice(0, 50).forEach((item: any) => {
            const y = doc.y;
            headers.forEach((header, i) => {
              let value = item[header];
              if (typeof value === 'number' && header.includes('amount')) {
                value = `€${(value / 100).toFixed(2)}`;
              }
              doc.text(
                String(value || '-'),
                70 + (i * colWidth),
                y,
                { width: colWidth - 5, continued: i < headers.length - 1 }
              );
            });
            doc.moveDown(0.5);

            if (doc.y > 700) {
              doc.addPage();
            }
          });

          if (data.items.length > 50) {
            doc.moveDown(1);
            doc.fontSize(8).fillColor('gray').text(
              `Note: Only first 50 records shown. Total records: ${data.items.length}`,
              { align: 'center' }
            );
          }
        }

        doc.fontSize(8).fillColor('gray');
        const pageCount = doc.bufferedPageRange().count;
        for (let i = 0; i < pageCount; i++) {
          doc.switchToPage(i);
          doc.text(
            `Page ${i + 1} of ${pageCount} | Generated by Oliver Admin Panel`,
            50,
            750,
            { align: 'center' }
          );
        }

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  private async generateCSV(data: any): Promise<Buffer> {
    try {
      const items = data.items || [];
      if (items.length === 0) {
        throw new Error('No data to export');
      }

      const parser = new Parser();
      const csv = parser.parse(items);
      return Buffer.from(csv, 'utf-8');
    } catch (error) {
      this.logger.error('Error generating CSV', error);
      throw error;
    }
  }

  private async generateXLSX(data: any): Promise<Buffer> {
    try {
      const items = data.items || [];
      if (items.length === 0) {
        throw new Error('No data to export');
      }

      const worksheet = XLSX.utils.json_to_sheet(items);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
      
      const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const address = XLSX.utils.encode_col(C) + "1";
        if (!worksheet[address]) continue;
        worksheet[address].s = {
          font: { bold: true },
          fill: { fgColor: { rgb: "00B8A9" } },
        };
      }

      return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' }) as Buffer;
    } catch (error) {
      this.logger.error('Error generating XLSX', error);
      throw error;
    }
  }

  private calculateDateRange(period: string, year: number, month?: number) {
    let start: Date;
    let end: Date;

    switch (period) {
      case 'day':
        start = new Date(year, month ? month - 1 : 0, 1);
        end = new Date(year, month ? month - 1 : 0, 1, 23, 59, 59);
        break;
      case 'week':
        start = new Date(year, month ? month - 1 : 0, 1);
        end = new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        start = new Date(year, month ? month - 1 : 0, 1);
        end = new Date(year, month ? month : 12, 0, 23, 59, 59);
        break;
      case 'year':
        start = new Date(year, 0, 1);
        end = new Date(year, 11, 31, 23, 59, 59);
        break;
      default:
        start = new Date(year, 0, 1);
        end = new Date(year, 11, 31, 23, 59, 59);
    }

    return { start, end };
  }

  private async calculateRevenue(dateRange: any) {
    const result = await this.prisma.payment.aggregate({
      where: {
        status: 'SUCCESS',
        type: { in: ['SUBSCRIPTION', 'PPV', 'TIP', 'PURCHASE'] },
        createdAt: { gte: dateRange.start, lte: dateRange.end },
      },
      _sum: { amount: true },
    });
    return result._sum.amount || 0;
  }

  private async calculateFees(dateRange: any) {
    const result = await this.prisma.payment.aggregate({
      where: {
        status: 'SUCCESS',
        createdAt: { gte: dateRange.start, lte: dateRange.end },
      },
      _sum: { processingFee: true },
    });
    return result._sum.processingFee || 0;
  }

  private async calculatePayouts(dateRange: any) {
    const result = await this.prisma.payout.aggregate({
      where: {
        status: 'COMPLETED',
        completedAt: { gte: dateRange.start, lte: dateRange.end },
      },
      _sum: { amount: true },
    });
    return result._sum.amount || 0;
  }

  private async calculateOperatingCosts(dateRange: any) {
    return 0;
  }

  private async getRevenueBreakdown(dateRange: any) {
    const [subscriptions, ppv, tips, marketplace] = await Promise.all([
      this.prisma.payment.aggregate({
        where: {
          type: 'SUBSCRIPTION',
          status: 'SUCCESS',
          createdAt: { gte: dateRange.start, lte: dateRange.end },
        },
        _sum: { amount: true },
      }),
      this.prisma.payment.aggregate({
        where: {
          type: 'PPV',
          status: 'SUCCESS',
          createdAt: { gte: dateRange.start, lte: dateRange.end },
        },
        _sum: { amount: true },
      }),
      this.prisma.payment.aggregate({
        where: {
          type: 'TIP',
          status: 'SUCCESS',
          createdAt: { gte: dateRange.start, lte: dateRange.end },
        },
        _sum: { amount: true },
      }),
      this.prisma.payment.aggregate({
        where: {
          type: 'MARKETPLACE',
          status: 'SUCCESS',
          createdAt: { gte: dateRange.start, lte: dateRange.end },
        },
        _sum: { amount: true },
      }),
    ]);

    return {
      subscriptions: subscriptions._sum.amount || 0,
      ppv: ppv._sum.amount || 0,
      tips: tips._sum.amount || 0,
      marketplace: marketplace._sum.amount || 0,
    };
  }

  private async getAccountingData(filters: any) {
    const dateFrom = new Date(filters.dateFrom);
    const dateTo = new Date(filters.dateTo);

    const [payments, payouts, summary] = await Promise.all([
      this.prisma.payment.findMany({
        where: {
          status: 'SUCCESS',
          createdAt: { gte: dateFrom, lte: dateTo },
        },
        select: {
          id: true,
          amount: true,
          type: true,
          status: true,
          createdAt: true,
          user: { select: { username: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.payout.findMany({
        where: {
          status: 'COMPLETED',
          completedAt: { gte: dateFrom, lte: dateTo },
        },
      }),
      this.getSummary({
        period: 'month',
        year: dateFrom.getFullYear(),
        month: dateFrom.getMonth() + 1,
      }),
    ]);

    return {
      summary: {
        totalRevenue: summary.revenue,
        platformFees: summary.fees,
        commission: summary.commission,
        netProfit: summary.netProfit,
      },
      items: payments.map((p) => ({
        id: p.id,
        date: p.createdAt.toISOString(),
        type: p.type,
        username: p.user.username,
        amount: p.amount,
        status: p.status,
      })),
    };
  }

  private async getTransactionsData(filters: any) {
    const transactions = await this.prisma.payment.findMany({
      where: {
        createdAt: {
          gte: new Date(filters.dateFrom),
          lte: new Date(filters.dateTo),
        },
      },
      include: {
        user: { select: { id: true, username: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      items: transactions.map((t) => ({
        transactionId: t.id,
        date: t.createdAt.toISOString(),
        userId: t.user.username,
        email: t.user.email,
        type: t.type,
        amount: t.amount,
        processingFee: t.processingFee || 0,
        status: t.status,
        paymentMethod: t.paymentMethod,
      })),
    };
  }

  private async getPayoutsData(filters: any) {
    const payouts = await this.prisma.payout.findMany({
      where: {
        createdAt: {
          gte: new Date(filters.dateFrom),
          lte: new Date(filters.dateTo),
        },
      },
      include: {
        creator: { select: { id: true, username: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      items: payouts.map((p) => ({
        payoutId: p.id,
        date: p.createdAt.toISOString(),
        creatorUsername: p.creator.username,
        creatorEmail: p.creator.email,
        amount: p.amount,
        status: p.status,
        method: p.method,
        completedAt: p.completedAt?.toISOString() || 'Pending',
      })),
    };
  }
}

const GetAccountingSummarySchema = z.object({
  period: z.enum(['day', 'week', 'month', 'year']).default('month'),
  year: z.coerce.number().min(2020).max(2030).default(new Date().getFullYear()),
  month: z.coerce.number().min(1).max(12).optional(),
});

const ExportAccountingSchema = z.object({
  type: z.enum(['accounting', 'transactions', 'payouts']),
  format: z.enum(['csv', 'pdf', 'xlsx']),
  dateFrom: z.string(),
  dateTo: z.string(),
});

const GetExportHistorySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(50),
});

@Controller('admin/accounting')
@UseGuards(JwtAuthGuard, AdminRoleGuard, RateLimitGuard)
export class AccountingController {
  constructor(private readonly accountingService: AccountingService) {}

  @Get('summary')
  @HttpCode(HttpStatus.OK)
  async getSummary(@Query(new ZodValidationPipe(GetAccountingSummarySchema)) query: any) {
    return this.accountingService.getSummary(query);
  }

  @Post('export')
  @HttpCode(HttpStatus.ACCEPTED)
  async exportData(
    @Body(new ZodValidationPipe(ExportAccountingSchema)) dto: any,
    @Req() req: any,
  ) {
    return this.accountingService.exportData(dto, req.user.id);
  }

  @Get('exports')
  @HttpCode(HttpStatus.OK)
  async getExportHistory(@Query(new ZodValidationPipe(GetExportHistorySchema)) query: any) {
    return this.accountingService.getExportHistory(query.cursor, query.limit);
  }

  @Get('exports/:id/download')
  @HttpCode(HttpStatus.OK)
  async downloadExport(@Param('id') exportId: string, @Res() res: Response) {
    const exportRecord = await this.accountingService.getExportById(exportId);
    return res.redirect(exportRecord.fileUrl!);
  }
}
