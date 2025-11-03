// apps/api/src/modules/admin/controllers/dashboard.controller.ts

import { Controller, Get, UseGuards, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { AdminRoleGuard } from '../guards/admin-role.guard';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe';
import { DashboardService } from '../services/dashboard.service';
import { GetDashboardQuerySchema } from '../dto/dashboard.dto';
import type { GetDashboardQueryDto } from '../dto/dashboard.dto';

@Controller('admin/dashboard')
@UseGuards(JwtAuthGuard, AdminRoleGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('metrics')
  @HttpCode(HttpStatus.OK)
  async getMetrics(@Query(new ZodValidationPipe(GetDashboardQuerySchema)) query: GetDashboardQueryDto) {
    return this.dashboardService.getMetrics(query.period, query.refresh);
  }

  @Get('stats')
  @HttpCode(HttpStatus.OK)
  async getQuickStats() {
    return this.dashboardService.getQuickStats();
  }

  @Get('top-creators')
  @HttpCode(HttpStatus.OK)
  async getTopCreators(@Query('limit') limit?: string) {
    const parsedLimit = limit ? parseInt(limit, 10) : 5;
    return this.dashboardService.getTopCreators(parsedLimit);
  }

  @Get('engagement')
  @HttpCode(HttpStatus.OK)
  async getEngagementMetrics() {
    return this.dashboardService.getEngagementMetrics();
  }

  @Get('activity')
  @HttpCode(HttpStatus.OK)
  async getActivityMetrics() {
    return this.dashboardService.getActivityMetrics();
  }

  @Get('geography')
  @HttpCode(HttpStatus.OK)
  async getGeographyData(@Query('limit') limit?: string) {
    const parsedLimit = limit ? parseInt(limit, 10) : 5;
    return this.dashboardService.getGeographyData(parsedLimit);
  }

  @Get('funnel')
  @HttpCode(HttpStatus.OK)
  async getConversionFunnel() {
    return this.dashboardService.getConversionFunnel();
  }

  @Get('upcoming-payouts')
  @HttpCode(HttpStatus.OK)
  async getUpcomingPayouts() {
    return this.dashboardService.getUpcomingPayouts();
  }
}
