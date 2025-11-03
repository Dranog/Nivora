// apps/api/src/modules/admin/controllers/kyc.controller.ts

import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { KycService } from '../services/kyc.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { AdminRoleGuard } from '../guards/admin-role.guard';
import { RateLimitGuard } from '../../../common/guards/rate-limit.guard';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe';
import { z } from 'zod';

const GetKycQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(50),
});

const ApproveKycSchema = z.object({
  notes: z.string().max(1000).optional(),
});

const RejectKycSchema = z.object({
  reason: z.string().min(10).max(500),
  notes: z.string().max(1000).optional(),
});

@ApiTags('Admin - KYC')
@ApiBearerAuth()
@Controller('admin/kyc')
@UseGuards(JwtAuthGuard, AdminRoleGuard, RateLimitGuard)
export class KycController {
  constructor(private readonly kycService: KycService) {}

  @Get('pending')
  @HttpCode(HttpStatus.OK)
  async getPending(@Query(new ZodValidationPipe(GetKycQuerySchema)) query: any) {
    return this.kycService.getPending(query.cursor, query.limit);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getById(@Param('id') id: string) {
    return this.kycService.getById(id);
  }

  @Post(':id/approve')
  @HttpCode(HttpStatus.OK)
  async approve(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(ApproveKycSchema)) dto: any,
    @Req() req: any,
  ) {
    return this.kycService.approve(id, req.user.id, req);
  }

  @Post(':id/reject')
  @HttpCode(HttpStatus.OK)
  async reject(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(RejectKycSchema)) dto: any,
    @Req() req: any,
  ) {
    return this.kycService.reject(id, dto.reason, req.user.id, req);
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(@Body() payload: any) {
    await this.kycService.handleWebhook(payload);
    return { success: true };
  }
}
