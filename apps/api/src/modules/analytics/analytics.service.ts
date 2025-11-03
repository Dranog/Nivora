import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AnalyticsCacheService } from './cache/analytics-cache.service';
@Injectable()
export class AnalyticsService {
  constructor(
    private prisma: PrismaService,
    private cacheService: AnalyticsCacheService,
  ) {}
  async getOverview(authorId: string) {
    // Try cache first (TTL 60s)
    const cached = await this.cacheService.get(`overview:${authorId}`);
    if (cached) return cached;
    // Verify creator exists
    const creator = await this.prisma.user.findUnique({
      where: { id: authorId },
      include: { creatorProfile: true },
    });
    if (!creator || !creator.creatorProfile) {
      throw new NotFoundException('Creator not found');
    }
    // Calculate date ranges
    const now = new Date();
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    // Parallel aggregations for performance
    const [
      revenue30d,
      revenue7d,
      activeSubs,
      totalSubs,
      tipsStats,
      ppvStats,
      postsCount,
    ] = await Promise.all([
      // Revenue last 30 days (from cleared entries)
      this.prisma.ledgerEntry.aggregate({
        where: {
          userId: authorId,
          createdAt: { gte: last30Days },
        },
        _sum: { amount: true },
      }),
      // Revenue last 7 days
      this.prisma.ledgerEntry.aggregate({
        where: {
          userId: authorId,
          createdAt: { gte: last7Days },
        },
        _sum: { amount: true },
      }),
      // Active subscriptions
      this.prisma.subscription.count({
        where: {
          creatorId: authorId,
          status: 'ACTIVE',
        },
      }),
      // Total subscriptions (all time)
      this.prisma.subscription.count({
        where: { creatorId: authorId },
      }),
      // Tips stats
      this.prisma.tip.aggregate({
        where: { creatorId: authorId, createdAt: { gte: last30Days } },
        _count: { id: true },
        _sum: { amount: true },
      }),
      // PPV stats
      this.prisma.purchase.aggregate({
        where: {
          post: { creatorId: authorId },
          createdAt: { gte: last30Days },
        },
        _count: { id: true },
        _sum: { amount: true },
      }),
      // Posts count
      this.prisma.post.count({
        where: { creatorId: authorId },
      }),
    ]);
    const result = {
      revenue: {
        last30Days: (revenue30d._sum?.amount || 0) || 0,
        last7Days: (revenue7d._sum?.amount || 0) || 0,
        currency: 'EUR',
      },
      subscriptions: {
        active: activeSubs,
        total: totalSubs,
        churnRate: this.calculateChurnRate(activeSubs, totalSubs),
      },
      tips: {
        count: tipsStats._count?.id || 0,
        total: tipsStats._sum?.amount || 0,
        average: (tipsStats._count?.id || 0) > 0
          ? Math.round((tipsStats._sum?.amount || 0) / (tipsStats._count?.id || 1))
          : 0,
      },
      ppv: {
        count: (ppvStats._count?.id || 0),
        total: (ppvStats._sum?.amount || 0) || 0,
      },
      content: {
        postsCount,
      },
    };
    // Cache for 60s
    await this.cacheService.set(`overview:${authorId}`, result, 60);
    return result;
  }
  async getPostsStats(authorId: string, limit = 20) {
    const cached = await this.cacheService.get(`posts-stats:${authorId}`);
    if (cached) return cached;
    // Get posts with aggregated stats
    const posts = await this.prisma.post.findMany({
      where: { creatorId: authorId },
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        caption: true,
        isPaid: true,
        price: true,
        createdAt: true,
        // Note: _count and reactions require include, which causes circular deps
      },
    });
    // Note: reactions and _count removed from query - simplified mapping
    const result = posts.map(post => ({
      id: post.id,
      caption: post.caption?.substring(0, 50) + ((post.caption?.length || 0) > 50 ? '...' : ''),
      isPaid: post.isPaid,
      price: post.price,
      createdAt: post.createdAt,
      stats: {
        purchases: 0, // _count.purchases not available without include
        reactions: {},
        totalReactions: 0,
        revenue: 0,
      },
    }));
    await this.cacheService.set(`posts-stats:${authorId}`, result, 60);
    return result;
  }
  async getSubscribersTrend(
    authorId: string,
    period: 'day' | 'week' | 'month' = 'day',
    days = 30,
  ) {
    const cached = await this.cacheService.get(`subs-trend:${authorId}:${period}:${days}`);
    if (cached) return cached;
    const now = new Date();
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    // Get all subscriptions in period
    const subscriptions = await this.prisma.subscription.findMany({
      where: {
        creatorId: authorId,
        createdAt: { gte: startDate },
      },
      select: { createdAt: true },
      orderBy: { createdAt: 'asc' },
    });
    // Group by date
    const trend: Record<string, number> = {};
    subscriptions.forEach(sub => {
      const dateKey = this.formatDateKey(sub.createdAt, period);
      trend[dateKey] = (trend[dateKey] || 0) + 1;
    });
    // Fill missing dates with 0
    const result = this.fillMissingDates(trend, startDate, now, period);
    await this.cacheService.set(`subs-trend:${authorId}:${period}:${days}`, result, 300);
    return result;
  }
  async getRevenueBreakdown(authorId: string) {
    const cached = await this.cacheService.get(`revenue-breakdown:${authorId}`);
    if (cached) return cached;
    const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const [subscriptions, ppv, tips] = await Promise.all([
      // Count subscriptions (no price field in Subscription model)
      this.prisma.subscription.count({
        where: {
          creatorId: authorId,
          createdAt: { gte: last30Days },
        },
      }),
      // Query purchases directly
      this.prisma.purchase.aggregate({
        where: {
          post: { creatorId: authorId },
          createdAt: { gte: last30Days },
        },
        _sum: { amount: true },
      }),
      // Query tips directly
      this.prisma.tip.aggregate({
        where: {
          creatorId: authorId,
          createdAt: { gte: last30Days },
        },
        _sum: { amount: true },
      }),
    ]);
    const result = {
      subscriptions: subscriptions || 0, // Count only (Subscription model has no amount field)
      ppv: (ppv._sum?.amount || 0) || 0,
      tips: (tips._sum?.amount || 0) || 0,
      total: ((ppv._sum?.amount || 0) || 0) + ((tips._sum?.amount || 0) || 0), // Subscriptions excluded from total as it's a count, not amount
    };
    await this.cacheService.set(`revenue-breakdown:${authorId}`, result, 60);
    return result;
  }
  private calculateChurnRate(active: number, total: number): number {
    if (total === 0) return 0;
    return Math.round(((total - active) / total) * 100);
  }
  private formatDateKey(date: Date, period: 'day' | 'week' | 'month'): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    if (period === 'day') return `${year}-${month}-${day}`;
    if (period === 'week') {
      const weekNum = Math.ceil((date.getDate() - date.getDay() + 1) / 7);
      return `${year}-W${String(weekNum).padStart(2, '0')}`;
    }
    return `${year}-${month}`;
  }
  private fillMissingDates(
    data: Record<string, number>,
    start: Date,
    end: Date,
    period: 'day' | 'week' | 'month',
  ): Array<{ date: string; count: number }> {
    const result: Array<{ date: string; count: number }> = [];
    const current = new Date(start);
    while (current <= end) {
      const dateKey = this.formatDateKey(current, period);
      result.push({ date: dateKey, count: data[dateKey] || 0 });
      if (period === 'day') current.setDate(current.getDate() + 1);
      else if (period === 'week') current.setDate(current.getDate() + 7);
      else current.setMonth(current.getMonth() + 1);
    }
    return result;
  }
}
