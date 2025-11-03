// apps/api/src/modules/admin/finance/services/payouts.service.ts

import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { AuditLogService } from '../../core/services/audit-log.service';
import { EmailService } from '../../../integrations/email/email.service';

interface GetPayoutsFilters {
  status?: string;
  creatorId?: string;
  dateFrom?: string;
  dateTo?: string;
  cursor?: string;
  limit?: number;
}

interface ApprovePayoutDto {
  notes?: string;
}

interface RejectPayoutDto {
  reason: string;
  notes?: string;
}

interface BulkApproveDto {
  payoutIds: string[];
}

@Injectable()
export class PayoutsService {
  private readonly logger = new Logger(PayoutsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService,
    private readonly email: EmailService,
  ) {}

  async findAll(filters: GetPayoutsFilters) {
    const { status, creatorId, dateFrom, dateTo, cursor, limit = 50 } = filters;

    const where: any = {};

    if (status && status !== 'ALL') where.status = status;
    if (creatorId) where.creatorId = creatorId;
    
    if (dateFrom || dateTo) {
      where.requestedAt = {};
      if (dateFrom) where.requestedAt.gte = new Date(dateFrom);
      if (dateTo) where.requestedAt.lte = new Date(dateTo);
    }

    const payouts = await this.prisma.payout.findMany({
      where,
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: { requestedAt: 'desc' },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            email: true,
            avatar: true,
            displayName: true,
          },
        },
        approvedBy: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });

    const hasMore = payouts.length > limit;
    const items = hasMore ? payouts.slice(0, -1) : payouts;
    const nextCursor = hasMore ? items[items.length - 1].id : null;

    return {
      items: items.map(payout => ({
        ...payout,
        bankDetails: undefined, // Never expose bank details
      })),
      nextCursor,
      hasMore,
    };
  }

  async findById(id: string) {
    const payout = await this.prisma.payout.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            email: true,
            avatar: true,
            displayName: true,
            kycVerification: {
              select: {
                status: true,
                approvedAt: true,
              },
            },
          },
        },
        approvedBy: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });

    if (!payout) {
      throw new NotFoundException('Payout not found');
    }

    return {
      ...payout,
      bankDetails: undefined, // Never expose bank details in API
    };
  }

  async approve(id: string, dto: ApprovePayoutDto, adminId: string, request: any) {
    const payout = await this.prisma.payout.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            email: true,
            displayName: true,
            kycVerification: {
              select: {
                status: true,
              },
            },
          },
        },
      },
    });

    if (!payout) {
      throw new NotFoundException('Payout not found');
    }

    if (payout.status !== 'PENDING') {
      throw new BadRequestException(`Payout is already ${payout.status.toLowerCase()}`);
    }

    // Verify KYC
    if (payout.creator.kycVerification?.status !== 'VERIFIED') {
      throw new BadRequestException('Creator KYC must be verified before payout approval');
    }

    // Check if tax form is required
    if (payout.taxFormStatus === 'REQUIRED') {
      const taxForm = await this.prisma.taxForm.findUnique({
        where: { creatorId: payout.creatorId },
      });

      if (!taxForm || taxForm.status !== 'APPROVED') {
        throw new BadRequestException('Tax form must be approved before payout');
      }
    }

    // Update payout status
    const approvedPayout = await this.prisma.payout.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approvedById: adminId,
        approvedAt: new Date(),
        notes: dto.notes,
      },
    });

    // Log action
    await this.auditLog.log({
      actorId: adminId,
      action: 'payout.approve',
      targetType: 'payout',
      targetId: id,
      metadata: {
        amount: payout.amount,
        creatorId: payout.creatorId,
        notes: dto.notes,
      },
      request,
    });

    // Send confirmation email
    await this.email.sendPayoutApprovedEmail(payout.creator, {
      amount: payout.amount,
      currency: payout.currency,
      method: payout.method,
    });

    this.logger.log(`Payout ${id} approved by admin ${adminId}`);

    // Trigger processing (in real app, this would be a queue job)
    this.processPayout(id).catch(error => {
      this.logger.error(`Failed to process payout ${id}`, error);
    });

    return {
      success: true,
      payout: approvedPayout,
    };
  }

  async reject(id: string, dto: RejectPayoutDto, adminId: string, request: any) {
    const payout = await this.prisma.payout.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            email: true,
            displayName: true,
          },
        },
      },
    });

    if (!payout) {
      throw new NotFoundException('Payout not found');
    }

    if (payout.status !== 'PENDING') {
      throw new BadRequestException(`Payout is already ${payout.status.toLowerCase()}`);
    }

    const rejectedPayout = await this.prisma.payout.update({
      where: { id },
      data: {
        status: 'REJECTED',
        rejectedAt: new Date(),
        rejectionReason: dto.reason,
        notes: dto.notes,
      },
    });

    // Log action
    await this.auditLog.log({
      actorId: adminId,
      action: 'payout.reject',
      targetType: 'payout',
      targetId: id,
      metadata: {
        reason: dto.reason,
        notes: dto.notes,
        amount: payout.amount,
        creatorId: payout.creatorId,
      },
      request,
    });

    // Send notification email
    await this.email.sendPayoutRejectedEmail(payout.creator, {
      amount: payout.amount,
      currency: payout.currency,
      reason: dto.reason,
    });

    this.logger.log(`Payout ${id} rejected by admin ${adminId}`);

    return {
      success: true,
      payout: rejectedPayout,
    };
  }

  async bulkApprove(dto: BulkApproveDto, adminId: string, request: any) {
    const { payoutIds } = dto;

    if (payoutIds.length === 0) {
      throw new BadRequestException('No payout IDs provided');
    }

    if (payoutIds.length > 100) {
      throw new BadRequestException('Cannot bulk approve more than 100 payouts at once');
    }

    // Fetch all payouts
    const payouts = await this.prisma.payout.findMany({
      where: {
        id: { in: payoutIds },
        status: 'PENDING',
      },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            email: true,
            kycVerification: {
              select: {
                status: true,
              },
            },
          },
        },
      },
    });

    // Validate all payouts
    const errors: string[] = [];
    const validPayoutIds: string[] = [];

    for (const payout of payouts) {
      if (payout.creator.kycVerification?.status !== 'VERIFIED') {
        errors.push(`Payout ${payout.id}: Creator KYC not verified`);
        continue;
      }

      if (payout.taxFormStatus === 'REQUIRED') {
        const taxForm = await this.prisma.taxForm.findUnique({
          where: { creatorId: payout.creatorId },
        });

        if (!taxForm || taxForm.status !== 'APPROVED') {
          errors.push(`Payout ${payout.id}: Tax form not approved`);
          continue;
        }
      }

      validPayoutIds.push(payout.id);
    }

    // Update all valid payouts
    if (validPayoutIds.length > 0) {
      await this.prisma.payout.updateMany({
        where: { id: { in: validPayoutIds } },
        data: {
          status: 'APPROVED',
          approvedById: adminId,
          approvedAt: new Date(),
        },
      });

      // Log bulk action
      await this.auditLog.log({
        actorId: adminId,
        action: 'payout.bulk_approve',
        targetType: 'payout',
        targetId: null,
        metadata: {
          approvedCount: validPayoutIds.length,
          totalRequested: payoutIds.length,
          payoutIds: validPayoutIds,
        },
        request,
      });

      // Send emails and trigger processing
      for (const payout of payouts.filter(p => validPayoutIds.includes(p.id))) {
        await this.email.sendPayoutApprovedEmail(payout.creator, {
          amount: payout.amount,
          currency: payout.currency,
          method: payout.method,
        });

        this.processPayout(payout.id).catch(error => {
          this.logger.error(`Failed to process payout ${payout.id}`, error);
        });
      }

      this.logger.log(`Bulk approved ${validPayoutIds.length} payouts by admin ${adminId}`);
    }

    return {
      success: true,
      approved: validPayoutIds.length,
      total: payoutIds.length,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  async retry(id: string, adminId: string, request: any) {
    const payout = await this.prisma.payout.findUnique({
      where: { id },
    });

    if (!payout) {
      throw new NotFoundException('Payout not found');
    }

    if (payout.status !== 'FAILED') {
      throw new BadRequestException('Only failed payouts can be retried');
    }

    if (payout.retryCount >= payout.maxRetries) {
      throw new BadRequestException('Maximum retry attempts reached');
    }

    // Update payout for retry
    const updatedPayout = await this.prisma.payout.update({
      where: { id },
      data: {
        status: 'PROCESSING',
        retryCount: payout.retryCount + 1,
        nextRetryAt: null,
        failureReason: null,
      },
    });

    // Log action
    await this.auditLog.log({
      actorId: adminId,
      action: 'payout.retry',
      targetType: 'payout',
      targetId: id,
      metadata: {
        retryCount: updatedPayout.retryCount,
        previousFailureReason: payout.failureReason,
      },
      request,
    });

    this.logger.log(`Payout ${id} retry initiated by admin ${adminId}`);

    // Trigger processing
    this.processPayout(id).catch(error => {
      this.logger.error(`Failed to process payout ${id}`, error);
    });

    return {
      success: true,
      payout: updatedPayout,
    };
  }

  async getStatistics() {
    const [
      pending,
      approved,
      processing,
      completed,
      failed,
      totalPendingAmount,
      totalCompletedAmount,
    ] = await Promise.all([
      this.prisma.payout.count({ where: { status: 'PENDING' } }),
      this.prisma.payout.count({ where: { status: 'APPROVED' } }),
      this.prisma.payout.count({ where: { status: 'PROCESSING' } }),
      this.prisma.payout.count({ where: { status: 'COMPLETED' } }),
      this.prisma.payout.count({ where: { status: 'FAILED' } }),
      this.prisma.payout.aggregate({
        where: { status: 'PENDING' },
        _sum: { amount: true },
      }),
      this.prisma.payout.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { amount: true },
      }),
    ]);

    return {
      pending,
      approved,
      processing,
      completed,
      failed,
      totalPendingAmount: totalPendingAmount._sum.amount || 0,
      totalCompletedAmount: totalCompletedAmount._sum.amount || 0,
    };
  }

  private async processPayout(payoutId: string) {
    // This is a simplified version
    // In production, this would integrate with Stripe Connect, PayPal, or other payment processors
    
    try {
      await this.prisma.payout.update({
        where: { id: payoutId },
        data: { status: 'PROCESSING' },
      });

      // Simulate payment processing
      // In real app: await this.stripeService.createPayout(...)
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mark as completed
      await this.prisma.payout.update({
        where: { id: payoutId },
        data: {
          status: 'COMPLETED',
          processedAt: new Date(),
          completedAt: new Date(),
        },
      });

      this.logger.log(`Payout ${payoutId} completed successfully`);
    } catch (error) {
      this.logger.error(`Payout ${payoutId} processing failed`, error);

      const payout = await this.prisma.payout.findUnique({
        where: { id: payoutId },
      });

      if (!payout) return;

      // Calculate next retry time
      const nextRetryAt = payout.retryCount < payout.maxRetries
        ? new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
        : null;

      await this.prisma.payout.update({
        where: { id: payoutId },
        data: {
          status: 'FAILED',
          failedAt: new Date(),
          failureReason: error instanceof Error ? error.message : 'Unknown error',
          nextRetryAt,
        },
      });
    }
  }
}
