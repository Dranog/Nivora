import type { Request } from 'express';
import { Controller, Get, Query, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('CREATOR')
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Get('overview')
  async getOverview(@Req() req: Request) {
    return this.analyticsService.getOverview(req.user!.id);
  }

  @Get('posts')
  async getPostsStats(@Req() req: Request, @Query('limit') limit = 20) {
    return this.analyticsService.getPostsStats(req.user!.id, Number(limit));
  }

  @Get('subscribers')
  async getSubscribersTrend(
    @Req() req: Request,
    @Query('period') period: 'day' | 'week' | 'month' = 'day',
    @Query('days') days = 30,
  ) {
    return this.analyticsService.getSubscribersTrend(req.user!.id, period, Number(days));
  }

  @Get('revenue-breakdown')
  async getRevenueBreakdown(@Req() req: Request) {
    return this.analyticsService.getRevenueBreakdown(req.user!.id);
  }
}
