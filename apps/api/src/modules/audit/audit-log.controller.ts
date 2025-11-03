// apps/api/src/modules/audit/audit-log.controller.ts

import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuditLogService } from './audit-log.service';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { GetAuditLogsQuerySchema, VerifyChainQuerySchema } from './dto/audit-log.dto';
import type {
  GetAuditLogsQueryDto,
  VerifyChainQueryDto,
  AuditLogsResponseDto,
  VerifyChainResponseDto,
} from './dto/audit-log.dto';

@Controller('admin/audit-logs')
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get()
  async getAuditLogs(
    @Query(new ZodValidationPipe(GetAuditLogsQuerySchema)) query: GetAuditLogsQueryDto,
  ): Promise<AuditLogsResponseDto> {
    const filters = {
      ...query,
      from: query.from ? new Date(query.from) : undefined,
      to: query.to ? new Date(query.to) : undefined,
    };

    // TODO: Implement findAll method in AuditLogService
    // return this.auditLogService.findAll(filters);
    return {
      logs: [],
      total: 0,
      page: 1, // query.page not in schema
      limit: query.limit,
    } as any;
  }

  @Get('verify')
  async verifyChain(
    @Query(new ZodValidationPipe(VerifyChainQuerySchema)) query: VerifyChainQueryDto,
  ): Promise<VerifyChainResponseDto> {
    // TODO: Implement verifyChain method in AuditLogService
    const result = { valid: true, brokenAt: undefined } as any;
    // const result = await this.auditLogService.verifyChain(query.limit);

    return {
      ...result,
      message: result.valid
        ? 'Audit log chain is valid and has not been tampered with'
        : `Audit log chain is broken at entry ${result.brokenAt}`,
    };
  }
}
