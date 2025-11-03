// apps/api/src/modules/admin/services/dashboard.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { PrismaService } from '../../../common/prisma/prisma.service';
import {
  DashboardMetrics,
  DashboardResponse,
  TimeSeriesData,
  TopCreator,
  EngagementMetrics,
  ActivityMetrics,
  GeographyData,
  ConversionFunnel,
  UpcomingPayout,
} from '../dto/dashboard.dto';

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
      this.prisma.content.count({ where: { status: 'PENDING' } }),
      this.prisma.report.count({
        where: { status: { in: ['PENDING', 'UNDER_REVIEW'] } },
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
      if (item.priority) {
        reportsByPriorityMap[item.priority] = item._count.id;
      }
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
      this.prisma.user.count({ where: { lastActivityAt: { gte: last24h } } }),
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
      SELECT DATE("createdAt") as date, COUNT(*) as count
      FROM "users"
      WHERE "createdAt" >= ${since}
      GROUP BY DATE("createdAt")
      ORDER BY date ASC
    `;

    return data.map((item) => ({
      timestamp: item.date.toISOString(),
      value: Number(item.count),
    }));
  }

  private async getRevenueGrowthData(since: Date): Promise<TimeSeriesData[]> {
    const data = await this.prisma.$queryRaw<Array<{ date: Date; sum: number | null }>>`
      SELECT DATE("createdAt") as date, SUM(amount) as sum
      FROM "payments"
      WHERE "createdAt" >= ${since} AND status = 'SUCCESS'
      GROUP BY DATE("createdAt")
      ORDER BY date ASC
    `;

    return data.map((item) => ({
      timestamp: item.date.toISOString(),
      value: item.sum || 0,
    }));
  }

  private async getReportsTrendData(since: Date): Promise<TimeSeriesData[]> {
    const data = await this.prisma.$queryRaw<Array<{ date: Date; count: bigint }>>`
      SELECT DATE("createdAt") as date, COUNT(*) as count
      FROM "reports"
      WHERE "createdAt" >= ${since}
      GROUP BY DATE("createdAt")
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
          reporterId: true,
        },
      }),
      this.prisma.kycVerification.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          createdAt: true,
          userId: true,
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
        description: `Report ${report.reporterId}: ${report.reason.substring(0, 50)}...`,
        timestamp: report.createdAt ?? new Date(),
        priority: report.priority as any,
      });
    });

    recentKyc.forEach((kyc) => {
      activities.push({
        id: kyc.id,
        type: 'KYC_SUBMISSION',
        description: `KYC submission from user ${kyc.userId}`,
        timestamp: kyc.createdAt ?? new Date(),
      });
    });

    recentTransactions.forEach((transaction) => {
      activities.push({
        id: transaction.id,
        type: 'TRANSACTION',
        description: `${transaction.type} transaction: €${(transaction.amount / 100).toFixed(2)} from ${transaction.user.username}`,
        timestamp: transaction.createdAt ?? new Date(),
      });
    });

    return activities
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 20);
  }

  // ==========================================
  // New Dashboard Endpoints
  // ==========================================

  async getTopCreators(limit: number = 5): Promise<TopCreator[]> {
    const cacheKey = `admin:dashboard:top-creators:${limit}`;
    const cached = await this.redis.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    // Get top creators by revenue (users with creator_profiles)
    // Note: Payment table doesn't have creatorId, so we aggregate by userId
    const topCreators = await this.prisma.$queryRaw<
      Array<{
        id: string;
        username: string;
        displayName: string | null;
        avatar: string | null;
        revenue: number | null;
        subscribers: bigint;
        postsCount: bigint;
      }>
    >`
      SELECT
        u.id,
        cp.username,
        cp."displayName" as "displayName",
        u.avatar,
        COALESCE(SUM(p.amount), 0) as revenue,
        (SELECT COUNT(*) FROM "Subscription" s WHERE s."creatorId" = u.id AND s.status = 'ACTIVE') as subscribers,
        (SELECT COUNT(*) FROM "Post" po WHERE po."creatorId" = u.id) as "postsCount"
      FROM "users" u
      INNER JOIN "creator_profiles" cp ON cp."userId" = u.id
      LEFT JOIN "payments" p ON p."userId" = u.id AND p.status = 'SUCCESS'
      GROUP BY u.id, cp.username, cp."displayName", u.avatar
      ORDER BY revenue DESC
      LIMIT ${limit}
    `;

    const result: TopCreator[] = topCreators.map((creator) => ({
      id: creator.id,
      username: creator.username,
      displayName: creator.displayName,
      avatar: creator.avatar,
      revenue: creator.revenue || 0,
      subscribers: Number(creator.subscribers),
      postsCount: Number(creator.postsCount),
    }));

    await this.redis.setex(cacheKey, 60, JSON.stringify(result));

    return result;
  }

  async getEngagementMetrics(): Promise<EngagementMetrics> {
    const cacheKey = 'admin:dashboard:engagement';
    const cached = await this.redis.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    const now = new Date();
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last14Days = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    // Get total engagement metrics from Reaction table (capitalized)
    const [currentWeekMetrics, previousWeekMetrics] = await Promise.all([
      this.prisma.$queryRaw<Array<{ type: string; count: bigint }>>`
        SELECT type::text, COUNT(*) as count
        FROM "Reaction"
        WHERE "createdAt" >= ${last7Days}
        GROUP BY type
      `,
      this.prisma.$queryRaw<Array<{ type: string; count: bigint }>>`
        SELECT type::text, COUNT(*) as count
        FROM "Reaction"
        WHERE "createdAt" >= ${last14Days} AND "createdAt" < ${last7Days}
        GROUP BY type
      `,
    ]);

    // Get comments count (using messages table - lowercase)
    const [currentComments, previousComments] = await Promise.all([
      this.prisma.$queryRaw<Array<{ count: bigint }>>`
        SELECT COUNT(*) as count
        FROM "messages"
        WHERE "createdAt" >= ${last7Days}
      `,
      this.prisma.$queryRaw<Array<{ count: bigint }>>`
        SELECT COUNT(*) as count
        FROM "messages"
        WHERE "createdAt" >= ${last14Days} AND "createdAt" < ${last7Days}
      `,
    ]);

    const totalComments = currentComments[0]?.count ? Number(currentComments[0].count) : 0;
    const previousCommentsCount = previousComments[0]?.count ? Number(previousComments[0].count) : 0;

    const getCurrentCount = (type: string) => {
      const metric = currentWeekMetrics.find((m) => m.type === type);
      return metric ? Number(metric.count) : 0;
    };

    const getPreviousCount = (type: string) => {
      const metric = previousWeekMetrics.find((m) => m.type === type);
      return metric ? Number(metric.count) : 0;
    };

    const calculateGrowth = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    // Get likes from reactions (LIKE + LOVE + HEART types)
    const totalLikes = getCurrentCount('LIKE') + getCurrentCount('LOVE') + getCurrentCount('HEART');
    const previousLikes = getPreviousCount('LIKE') + getPreviousCount('LOVE') + getPreviousCount('HEART');

    // Shares would come from a shares table (not implemented yet, using boosts as proxy)
    const [totalShares, previousShares] = await Promise.all([
      this.prisma.boost.count({ where: { createdAt: { gte: last7Days } } }),
      this.prisma.boost.count({
        where: {
          createdAt: {
            gte: last14Days,
            lt: last7Days,
          },
        },
      }),
    ]);

    const result: EngagementMetrics = {
      totalLikes,
      totalComments,
      totalShares,
      likesGrowth: calculateGrowth(totalLikes, previousLikes),
      commentsGrowth: calculateGrowth(totalComments, previousCommentsCount),
      sharesGrowth: calculateGrowth(totalShares, previousShares),
    };

    await this.redis.setex(cacheKey, 60, JSON.stringify(result));

    return result;
  }

  async getActivityMetrics(): Promise<ActivityMetrics> {
    const cacheKey = 'admin:dashboard:activity';
    const cached = await this.redis.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    const now = new Date();
    const last15Minutes = new Date(now.getTime() - 15 * 60 * 1000);
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const [activeNow, sessionStats, bounceData] = await Promise.all([
      // Users active in last 15 minutes
      this.prisma.user.count({
        where: { lastActivityAt: { gte: last15Minutes } },
      }),
      // Calculate average session time from session duration (expiresAt - createdAt)
      this.prisma.$queryRaw<Array<{ avgDuration: number | null }>>`
        SELECT AVG(EXTRACT(EPOCH FROM ("expiresAt" - "createdAt"))) as "avgDuration"
        FROM "sessions"
        WHERE "createdAt" >= ${last24Hours}
          AND "expiresAt" IS NOT NULL
          AND "expiresAt" > "createdAt"
      `,
      // Bounce rate: users with only 1 session in last 24h
      this.prisma.$queryRaw<Array<{ totalUsers: bigint; singleSessionUsers: bigint }>>`
        SELECT
          COUNT(DISTINCT "userId") as "totalUsers",
          COUNT(DISTINCT CASE WHEN session_count = 1 THEN "userId" END) as "singleSessionUsers"
        FROM (
          SELECT "userId", COUNT(*) as session_count
          FROM "sessions"
          WHERE "createdAt" >= ${last24Hours}
          GROUP BY "userId"
        ) as user_sessions
      `,
    ]);

    const averageSessionTime = sessionStats[0]?.avgDuration || 0;
    const bounceRate =
      bounceData.length > 0 && Number(bounceData[0].totalUsers) > 0
        ? (Number(bounceData[0].singleSessionUsers) / Number(bounceData[0].totalUsers)) * 100
        : 0;

    const result: ActivityMetrics = {
      activeNow,
      averageSessionTime,
      bounceRate,
    };

    await this.redis.setex(cacheKey, 30, JSON.stringify(result));

    return result;
  }

  async getGeographyData(limit: number = 5): Promise<GeographyData[]> {
    const cacheKey = `admin:dashboard:geography:${limit}`;
    const cached = await this.redis.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    // Get revenue by country from user location field
    // Note: tax_forms table doesn't exist in database, using location field only
    const data = await this.prisma.$queryRaw<
      Array<{
        country: string | null;
        revenue: number | null;
      }>
    >`
      SELECT
        TRIM(SPLIT_PART(u.location, ',', -1)) as country,
        SUM(p.amount) as revenue
      FROM "payments" p
      INNER JOIN "users" u ON u.id = p."userId"
      WHERE p.status = 'SUCCESS'
        AND u.location IS NOT NULL
        AND u.location != ''
      GROUP BY TRIM(SPLIT_PART(u.location, ',', -1))
      ORDER BY revenue DESC
      LIMIT ${limit}
    `;

    const totalRevenue = data.reduce((sum, item) => sum + (item.revenue || 0), 0);

    // Simple country code mapping for common countries
    const countryCodeMap: Record<string, string> = {
      'France': 'FR', 'United States': 'US', 'USA': 'US',
      'United Kingdom': 'GB', 'UK': 'GB', 'Canada': 'CA',
      'Germany': 'DE', 'Spain': 'ES', 'Italy': 'IT',
    };

    const result: GeographyData[] = data.map((item) => {
      const country = (item.country || 'Unknown').trim();
      const countryCode = countryCodeMap[country] || country.substring(0, 2).toUpperCase();

      return {
        country,
        countryCode,
        revenue: item.revenue || 0,
        percentage: totalRevenue > 0 ? ((item.revenue || 0) / totalRevenue) * 100 : 0,
      };
    });

    await this.redis.setex(cacheKey, 120, JSON.stringify(result));

    return result;
  }

  async getConversionFunnel(): Promise<ConversionFunnel> {
    const cacheKey = 'admin:dashboard:funnel';
    const cached = await this.redis.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    const now = new Date();
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      usersWithProfile,
      usersWithFirstSubscriptionResult,
      activeUsers,
    ] = await Promise.all([
      // Total signups in last 30 days
      this.prisma.user.count({
        where: { createdAt: { gte: last30Days } },
      }),
      // Users who completed their profile
      this.prisma.user.count({
        where: {
          createdAt: { gte: last30Days },
          bio: { not: null },
        },
      }),
      // Users who made their first subscription (using raw SQL for correct table name)
      this.prisma.$queryRaw<Array<{ count: bigint }>>`
        SELECT COUNT(DISTINCT u.id) as count
        FROM "users" u
        INNER JOIN "Subscription" s ON s."fanId" = u.id
        WHERE u."createdAt" >= ${last30Days}
      `,
      // Active users (logged in at least once after signup)
      this.prisma.user.count({
        where: {
          createdAt: { gte: last30Days },
          lastActivityAt: { not: null },
        },
      }),
    ]);

    const usersWithFirstSubscription = usersWithFirstSubscriptionResult[0]?.count
      ? Number(usersWithFirstSubscriptionResult[0].count)
      : 0;

    // Note: Visitors data would come from analytics tracking (Google Analytics, etc.)
    // For now, we estimate visitors as 3x signups based on typical conversion rates
    const estimatedVisitors = totalUsers * 3;

    const result: ConversionFunnel = {
      visitors: estimatedVisitors,
      signups: totalUsers,
      profileCompleted: usersWithProfile,
      firstSubscription: usersWithFirstSubscription,
      activeUsers,
    };

    await this.redis.setex(cacheKey, 120, JSON.stringify(result));

    return result;
  }

  async getUpcomingPayouts(): Promise<UpcomingPayout[]> {
    const cacheKey = 'admin:dashboard:upcoming-payouts';
    const cached = await this.redis.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    const now = new Date();

    // Get pending payouts grouped by estimated release date
    // Note: Database has PENDING, APPROVED, PAID statuses (not PROCESSING or COMPLETED)
    const payouts = await this.prisma.payout.findMany({
      where: {
        status: { in: ['PENDING', 'APPROVED'] },
      },
      orderBy: { estimatedCompletionAt: 'asc' },
      take: 10,
    });

    const result: UpcomingPayout[] = payouts
      .filter((payout) => payout.amount !== null)
      .map((payout) => {
        const estimatedDate = payout.estimatedCompletionAt || new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        const daysUntil = Math.max(
          0,
          Math.ceil((estimatedDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)),
        );

        return {
          daysUntil,
          amount: payout.amount!,
          status: payout.status === 'APPROVED' ? 'released' : 'pending',
          estimatedDate,
        };
      });

    await this.redis.setex(cacheKey, 60, JSON.stringify(result));

    return result;
  }
}
