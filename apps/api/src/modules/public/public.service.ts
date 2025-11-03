import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { PublicCacheService } from './cache/public-cache.service';

@Injectable()
export class PublicService {
  constructor(
    private prisma: PrismaService,
    private cacheService: PublicCacheService,
  ) {}

  async getCreatorByHandle(handle: string) {
    // Cache public profiles for 5min
    const cached = await this.cacheService.get(`creator:${handle}`);
    if (cached) return cached;

    const creator = await this.prisma.creatorProfile.findUnique({
      where: { username: handle },
      include: {
        user: {
          select: {
            id: true,
            email: false, // Don't expose email
            createdAt: true,
          },
        },
      },
    });

    if (!creator) {
      throw new NotFoundException('Creator not found');
    }

    // Get public stats
    const [subsCount, postsCount, teasers] = await Promise.all([
      this.prisma.subscription.count({
        where: {
          creatorId: creator.userId,
          status: 'ACTIVE',
        },
      }),

      this.prisma.post.count({
        where: {
          creatorId: creator.userId,
          status: 'PUBLISHED',
        },
      }),

      // Teasers (free posts or preview of paid)
      this.prisma.post.findMany({
        where: {
          creatorId: creator.userId,
          status: 'PUBLISHED',
        },
        take: 6,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          caption: true,
          isPaid: true,
          price: true,
          createdAt: true,
          media: {
            take: 1,
            select: {
              id: true,
              contentType: true,
              watermarked: true,
            },
          },
        },
      }),
    ]);

    const result = {
      profile: {
        username: creator.username,
        bio: creator.bio,
        avatar: creator.avatar,
        // kycLevel removed (not in schema)
        verified: false, // kycLevel not in schema
      },
      stats: {
        subscribers: subsCount,
        posts: postsCount,
        memberSince: creator.user.createdAt,
      },
      teasers: teasers.map(post => ({
        id: post.id,
        caption: post.caption?.substring(0, 100),
        isPaid: post.isPaid,
        price: post.price,
        hasPreview: (post as any).media?.length > 0,
        mediaType: (post as any).media?.[0]?.contentType.startsWith('video') ? 'video' : 'image',
      })),
    };

    await this.cacheService.set(`creator:${handle}`, result, 300);

    return result;
  }

  async getTrending(limit = 20) {
    const cached = await this.cacheService.get('trending');
    if (cached) return cached;

    // Get creators sorted by revenue + active subs
    const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const creatorsRevenue = await this.prisma.ledgerEntry.groupBy({
      by: ['creatorId'],
      where: {
        createdAt: { gte: last30Days },
      },
      _sum: { amount: true },
      orderBy: { creatorId: 'desc' },
      take: limit,
    });

    // Fetch creator profiles
    const creators = await Promise.all(
      creatorsRevenue.map(async ({ creatorId, _sum }) => {
        const profile = await this.prisma.creatorProfile.findUnique({
          where: { userId: creatorId ?? undefined },
          select: {
            username: true,
            bio: true,
            avatar: true,
          },
        });

        const subsCount = await this.prisma.subscription.count({
          where: { creatorId: creatorId ?? undefined, status: 'ACTIVE' },
        });

        return {
          username: profile?.username,
          bio: profile?.bio?.substring(0, 100),
          avatar: profile?.avatar,
          verified: false, // kycLevel not in schema
          stats: {
            revenue30d: _sum?.amount || 0,
            subscribers: subsCount,
          },
        };
      }),
    );

    await this.cacheService.set('trending', creators, 300);

    return creators;
  }

  async getExplore(filters: { category?: string }, pagination: { limit: number; offset: number }) {
    // Simple pagination of all creators
    const [creators, total] = await Promise.all([
      this.prisma.creatorProfile.findMany({
        skip: pagination.offset,
        take: pagination.limit,
        orderBy: { createdAt: 'desc' },
        select: {
          username: true,
          bio: true,
          avatar: true,
          userId: true,
        },
      }),
      this.prisma.creatorProfile.count(),
    ]);

    // Enrich with stats
    const enriched = await Promise.all(
      creators.map(async creator => {
        const subsCount = await this.prisma.subscription.count({
        where: {
          creatorId: creator.userId, status: 'ACTIVE' },
        });

        return {
          username: creator.username,
          bio: creator.bio?.substring(0, 100),
          avatar: creator.avatar,
          verified: false, // kycLevel not in schema
          subscribers: subsCount,
        };
      }),
    );

    return { creators: enriched, total };
  }
}
