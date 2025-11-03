// apps/api/src/modules/admin/controllers/dashboard.controller.ts

import { Controller, Get, UseGuards, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { Injectable, Logger } from '@nestjs/common';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { AdminRoleGuard } from '../guards/admin-role.guard';
import { Redis } from 'ioredis';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { z } from 'zod';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe';

interface DashboardMetrics {
  users: {
    total: number;
    verified: number;
    suspended: number;
    newToday: number;
    newThisWeek: number;
    newThisMonth: number;
  };
  content: {
    totalVideos: number;
    totalPosts: number;
    pendingModeration: number;
    reportedContent: number;
  };
  financial: {
    totalRevenue: number;
    revenueThisMonth: number;
    subscriptionRevenue: number;
    ppvRevenue: number;
    tipRevenue: number;
    marketplaceRevenue: number;
    pendingPayouts: number;
  };
  reports: {
    total: number;
    pending: number;
    resolved: number;
    escalated: number;
    byPriority: {
      LOW: number;
      MEDIUM: number;
      HIGH: number;
      CRITICAL: number;
    };
  };
  kyc: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  };
}

interface TimeSeriesData {
  timestamp: string;
  value: number;
}

interface DashboardResponse {
  metrics: DashboardMetrics;
  charts: {
    userGrowth: TimeSeriesData[];
    revenueGrowth: TimeSeriesData[];
    reportsTrend: TimeSeriesData[];
  };
  recentActivity: Array<{
    id: string;
    type: 'USER_SIGNUP' | 'CONTENT_REPORT' | 'KYC_SUBMISSION' | 'TRANSACTION';
    description: string;
    timestamp: Date;
    priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  }>;
  cachedAt: Date;
}

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(
    private readonly prisma: PrismaService,
    @InjectRedis() private readonly redis: Redis,
  ) {}

  async getMetrics(period: 'day' | 'week' | 'month', refresh: boolean): Promise<DashboardResponse> {
    const cacheKey = `admin:dashboard:metrics:${period}`;

    if (!refresh) {
      const cached = await this.redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    }

    const now = new Date();
    const { startOfToday, startOfWeek, startOfMonth, startOfLast30Days } = this.getDateRanges(now);

    const [
      totalUsers,
      verifiedUsers,
      suspendedUsers,
      newUsersToday,
      newUsersThisWeek,
      newUsersThisMonth,
      totalVideos,
      totalPosts,
      pendingModerationContent,
      reportedContent,
      totalRevenueResult,
      revenueThisMonthResult,
      subscriptionRevenueResult,
      ppvRevenueResult,
      tipRevenueResult,
      marketplaceRevenueResult,
      pendingPayoutsResult,
      totalReports,
      pendingReports,
      resolvedReports,
      escalatedReports,
      reportsByPriority,
      totalKyc,
      pendingKyc,
      approvedKyc,
      rejectedKyc,
      userGrowthData,
      revenueGrowthData,
      reportsTrendData,
      recentActivity,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { emailVerified: true } }),
      this.prisma.user.count({ where: { status: 'SUSPENDED' } }),
      this.prisma.user.count({ where: { createdAt: { gte: startOfToday } } }),
      this.prisma.user.count({ where: { createdAt: { gte: startOfWeek } } }),
      this.prisma.user.count({ where: { createdAt: { gte: startOfMonth } } }),
      this.prisma.video.count(),
      this.prisma.post.count(),
      this.prisma.content.count({ where: { moderationStatus: 'PENDING' } }),
      this.prisma.content.count({
        where: {
          reports: {
            some: {
              status: { in: ['PENDING', 'UNDER_REVIEW'] },
            },
          },
        },
      }),
      this.prisma.payment.aggregate({ _sum: { amount: true } }),
      this.prisma.payment.aggregate({
        where: { createdAt: { gte: startOfMonth }, status: 'SUCCESS' },
        _sum: { amount: true },
      }),
      this.prisma.payment.aggregate({
        where: { type: 'SUBSCRIPTION', status: 'SUCCESS' },
        _sum: { amount: true },
      }),
      this.prisma.payment.aggregate({
        where: { type: 'PPV', status: 'SUCCESS' },
        _sum: { amount: true },
      }),
      this.prisma.payment.aggregate({
        where: { type: 'TIP', status: 'SUCCESS' },
        _sum: { amount: true },
      }),
      this.prisma.payment.aggregate({
        where: { type: 'MARKETPLACE', status: 'SUCCESS' },
        _sum: { amount: true },
      }),
      this.prisma.payout.aggregate({
        where: { status: 'PENDING' },
        _sum: { amount: true },
      }),
      this.prisma.report.count(),
      this.prisma.report.count({ where: { status: { in: ['PENDING', 'UNDER_REVIEW'] } } }),
      this.prisma.report.count({ where: { status: 'RESOLVED' } }),
      this.prisma.report.count({ where: { status: 'ESCALATED' } }),
      this.prisma.report.groupBy({
        by: ['priority'],
        _count: { id: true },
      }),
      this.prisma.kycVerification.count(),
      this.prisma.kycVerification.count({ where: { status: 'PENDING' } }),
      this.prisma.kycVerification.count({ where: { status: 'VERIFIED' } }),
      this.prisma.kycVerification.count({ where: { status: 'REJECTED' } }),
      this.getUserGrowthData(startOfLast30Days),
      this.getRevenueGrowthData(startOfLast30Days),
      this.getReportsTrendData(startOfLast30Days),
      this.getRecentActivity(),
    ]);

    const reportsByPriorityMap: Record<string, number> = {
      LOW: 0,
      MEDIUM: 0,
      HIGH: 0,
      CRITICAL: 0,
    };

    reportsByPriority.forEach((item) => {
      reportsByPriorityMap[item.priority] = item._count.id;
    });

    const metrics: DashboardMetrics = {
      users: {
        total: totalUsers,
        verified: verifiedUsers,
        suspended: suspendedUsers,
        newToday: newUsersToday,
        newThisWeek: newUsersThisWeek,
        newThisMonth: newUsersThisMonth,
      },
      content: {
        totalVideos,
        totalPosts,
        pendingModeration: pendingModerationContent,
        reportedContent,
      },
      financial: {
        totalRevenue: totalRevenueResult._sum.amount || 0,
        revenueThisMonth: revenueThisMonthResult._sum.amount || 0,
        subscriptionRevenue: subscriptionRevenueResult._sum.amount || 0,
        ppvRevenue: ppvRevenueResult._sum.amount || 0,
        tipRevenue: tipRevenueResult._sum.amount || 0,
        marketplaceRevenue: marketplaceRevenueResult._sum.amount || 0,
        pendingPayouts: pendingPayoutsResult._sum.amount || 0,
      },
      reports: {
        total: totalReports,
        pending: pendingReports,
        resolved: resolvedReports,
        escalated: escalatedReports,
        byPriority: reportsByPriorityMap as any,
      },
      kyc: {
        total: totalKyc,
        pending: pendingKyc,
        approved: approvedKyc,
        rejected: rejectedKyc,
      },
    };

    const response: DashboardResponse = {
      metrics,
      charts: {
        userGrowth: userGrowthData,
        revenueGrowth: revenueGrowthData,
        reportsTrend: reportsTrendData,
      },
      recentActivity,
      cachedAt: now,
    };

    await this.redis.setex(cacheKey, 30, JSON.stringify(response));

    return response;
  }

  async invalidateCache(period?: 'day' | 'week' | 'month') {
    if (period) {
      await this.redis.del(`admin:dashboard:metrics:${period}`);
    } else {
      await this.redis.del(
        'admin:dashboard:metrics:day',
        'admin:dashboard:metrics:week',
        'admin:dashboard:metrics:month',
      );
    }
  }

  async getQuickStats() {
    const cacheKey = 'admin:dashboard:quickstats';
    const cached = await this.redis.get(cacheKey);
    
    if (cached) {
      return JSON.parse(cached);
    }

    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const [activeUsers, pendingReports, criticalReports] = await Promise.all([
      this.prisma.user.count({ where: { lastActiveAt: { gte: last24h } } }),
      this.prisma.report.count({ where: { status: { in: ['PENDING', 'UNDER_REVIEW'] } } }),
      this.prisma.report.count({
        where: {
          priority: 'CRITICAL',
          status: { in: ['PENDING', 'UNDER_REVIEW'] },
        },
      }),
    ]);

    const result = {
      activeUsers24h: activeUsers,
      pendingActions: pendingReports,
      criticalAlerts: criticalReports,
    };

    await this.redis.setex(cacheKey, 30, JSON.stringify(result));

    return result;
  }

  private getDateRanges(now: Date) {
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - 7);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLast30Days = new Date(now);
    startOfLast30Days.setDate(now.getDate() - 30);

    return { startOfToday, startOfWeek, startOfMonth, startOfLast30Days };
  }

  private async getUserGrowthData(since: Date): Promise<TimeSeriesData[]> {
    const data = await this.prisma.$queryRaw<Array<{ date: Date; count: bigint }>>`
      SELECT DATE(created_at) as date, COUNT(*) as count
      FROM "User"
      WHERE created_at >= ${since}
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `;

    return data.map((item) => ({
      timestamp: item.date.toISOString(),
      value: Number(item.count),
    }));
  }

  private async getRevenueGrowthData(since: Date): Promise<TimeSeriesData[]> {
    const data = await this.prisma.$queryRaw<Array<{ date: Date; sum: number | null }>>`
      SELECT DATE(created_at) as date, SUM(amount) as sum
      FROM "Payment"
      WHERE created_at >= ${since} AND status = 'SUCCESS'
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `;

    return data.map((item) => ({
      timestamp: item.date.toISOString(),
      value: item.sum || 0,
    }));
  }

  private async getReportsTrendData(since: Date): Promise<TimeSeriesData[]> {
    const data = await this.prisma.$queryRaw<Array<{ date: Date; count: bigint }>>`
      SELECT DATE(created_at) as date, COUNT(*) as count
      FROM "Report"
      WHERE created_at >= ${since}
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `;

    return data.map((item) => ({
      timestamp: item.date.toISOString(),
      value: Number(item.count),
    }));
  }

  private async getRecentActivity(): Promise<DashboardResponse['recentActivity']> {
    const [recentUsers, recentReports, recentKyc, recentTransactions] = await Promise.all([
      this.prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { id: true, username: true, createdAt: true },
      }),
      this.prisma.report.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          reason: true,
          priority: true,
          createdAt: true,
          reporter: { select: { username: true } },
        },
      }),
      this.prisma.kycVerification.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          createdAt: true,
          user: { select: { username: true } },
        },
      }),
      this.prisma.payment.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          type: true,
          amount: true,
          createdAt: true,
          user: { select: { username: true } },
        },
      }),
    ]);

    const activities: DashboardResponse['recentActivity'] = [];

    recentUsers.forEach((user) => {
      activities.push({
        id: user.id,
        type: 'USER_SIGNUP',
        description: `New user registered: ${user.username}`,
        timestamp: user.createdAt,
      });
    });

    recentReports.forEach((report) => {
      activities.push({
        id: report.id,
        type: 'CONTENT_REPORT',
        description: `Report by ${report.reporter.username}: ${report.reason.substring(0, 50)}...`,
        timestamp: report.createdAt,
        priority: report.priority as any,
      });
    });

    recentKyc.forEach((kyc) => {
      activities.push({
        id: kyc.id,
        type: 'KYC_SUBMISSION',
        description: `KYC submission from ${kyc.user.username}`,
        timestamp: kyc.createdAt,
      });
    });

    recentTransactions.forEach((transaction) => {
      activities.push({
        id: transaction.id,
        type: 'TRANSACTION',
        description: `${transaction.type} transaction: €${(transaction.amount / 100).toFixed(2)} from ${transaction.user.username}`,
        timestamp: transaction.createdAt,
      });
    });

    return activities
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 20);
  }
}

const GetDashboardQuerySchema = z.object({
  period: z.enum(['day', 'week', 'month']).default('day'),
  refresh: z.coerce.boolean().default(false),
});

@Controller('admin/dashboard')
@UseGuards(JwtAuthGuard, AdminRoleGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('metrics')
  @HttpCode(HttpStatus.OK)
  async getMetrics(@Query(new ZodValidationPipe(GetDashboardQuerySchema)) query: any) {
    return this.dashboardService.getMetrics(query.period, query.refresh);
  }

  @Get('stats')
  @HttpCode(HttpStatus.OK)
  async getQuickStats() {
    return this.dashboardService.getQuickStats();
  }
}
