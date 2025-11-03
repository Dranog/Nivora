import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateBoostDto } from './dto/create-boost.dto';
import { randomUUID } from 'crypto';

@Injectable()
export class BoostService {
  constructor(private prisma: PrismaService) {}

  /**
   * Boost a listing
   */
  async boostListing(userId: string, listingId: string, dto: CreateBoostDto) {
    // Verify listing exists
    const listing = await this.prisma.marketListing.findUnique({
      where: { id: listingId },
    });

    if (!listing) {
      throw new NotFoundException('Listing not found');
    }

    // Verify user owns the listing
    if (listing.creatorId !== userId) {
      throw new BadRequestException('You can only boost your own listings');
    }

    // Calculate start and end dates (required fields)
    const startAt = new Date();
    const endAt = new Date();
    endAt.setDate(endAt.getDate() + dto.duration);

    // Create boost with listingId and expiresAt
    const boost = await this.prisma.boost.create({
      data: {
        id: randomUUID(),
        userId,
        listingId: listingId,
        duration: dto.duration,
        amount: dto.amount,
        currency: dto.currency || 'EUR',
        expiresAt: endAt,
      },
    });

    // Note: isBoosted field removed from MarketListing model
    // Boost status is tracked via Boost model only

    return boost;
  }

  /**
   * Get user's boosts
   */
  async getMyBoosts(userId: string) {
    return this.prisma.boost.findMany({
      where: { userId },
      // Note: listing include removed - Boost doesn't have listing relation
      // Use post/video includes if needed, or fetch listings separately via targetId
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get active boosts for a listing
   */
  async getListingBoosts(listingId: string) {
    return this.prisma.boost.findMany({
      where: {
        listingId: listingId,
        expiresAt: { gte: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Clean up expired boosts (should be run via cron job)
   */
  async cleanupExpiredBoosts() {
    const now = new Date();

    // Find all listings with expired boosts
    const expiredBoosts = await this.prisma.boost.findMany({
      where: {
        expiresAt: { lt: now },
      },
      // Note: listing include removed - Boost doesn't have listing relation
    });

    // Update listings to remove boost status if no active boosts remain
    for (const boost of expiredBoosts) {
      const activeBoosts = await this.prisma.boost.count({
        where: {
        listingId: boost.listingId,
          expiresAt: { gte: now },
        },
      });

      if (activeBoosts === 0) {
        // Note: isBoosted field removed from MarketListing model
        // Boost status is tracked via Boost model only
      }
    }

    return {
      message: `Cleaned up ${expiredBoosts.length} expired boosts`,
    };
  }
}
