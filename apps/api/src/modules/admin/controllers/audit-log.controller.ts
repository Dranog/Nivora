import {
  Controller,
  Get,
  Query,
  Res,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole as Role } from '@prisma/client';
import { AuditLogService } from '../services/audit-log.service';
import { Transform } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  Min,
  Max,
  IsIn,
  IsISO8601,
  Length,
} from 'class-validator';

const MAX_PAGE_SIZE = 200;

export class GetAuditLogQueryDto {
  @IsOptional()
  @IsISO8601({ strict: true })
  dateFrom?: string;

  @IsOptional()
  @IsISO8601({ strict: true })
  dateTo?: string;

  @IsOptional()
  @IsString()
  @Length(1, 120)
  userId?: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  event?: string;

  @IsOptional()
  @Transform(({ value }) => (value !== undefined ? Number(value) : 1))
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => (value !== undefined ? Number(value) : 50))
  @IsInt()
  @Min(1)
  @Max(MAX_PAGE_SIZE)
  pageSize?: number = 50;
}

@Controller('admin/audit-log')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get()
  async list(@Query() dto: GetAuditLogQueryDto) {
    if (dto.dateFrom && dto.dateTo) {
      const from = new Date(dto.dateFrom);
      const to = new Date(dto.dateTo);
      if (from.getTime() > to.getTime()) {
        throw new BadRequestException(
          'La date de début doit être antérieure ou égale à la date de fin.',
        );
      }
    }

    const result = await this.auditLogService.find({
      dateFrom: dto.dateFrom,
      dateTo: dto.dateTo,
      userId: dto.userId,
      event: dto.event,
      page: dto.page ?? 1,
      pageSize: dto.pageSize ?? 50,
    });

    return {
      items: result.items,
      total: result.total,
      page: dto.page ?? 1,
      pageSize: dto.pageSize ?? 50,
    };
  }

  @Get('export.csv')
  async exportCsv(@Query() dto: GetAuditLogQueryDto, @Res() res: import('express').Response) {
    if (dto.dateFrom && dto.dateTo) {
      const from = new Date(dto.dateFrom);
      const to = new Date(dto.dateTo);
      if (from.getTime() > to.getTime()) {
        throw new BadRequestException(
          'La date de début doit être antérieure ou égale à la date de fin.',
        );
      }
    }

    // Pour l'export, on ignore la pagination et on exporte le jeu filtré complet.
    const csvBuffer = await this.auditLogService.exportCsv({
      dateFrom: dto.dateFrom,
      dateTo: dto.dateTo,
      userId: dto.userId,
      event: dto.event,
      // Pas de page/pageSize pour l'export
    });

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="audit-log_${timestamp}.csv"`,
    );
    res.status(200).send(csvBuffer);
  }
}
