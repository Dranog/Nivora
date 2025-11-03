import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateListingDto } from './dto/create-listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { ListingStatus } from '@prisma/client';
import { randomUUID } from 'crypto';

@Injectable()
export class MarketplaceService {
  constructor(private prisma: PrismaService) {}

  // ============================================================================
  // LISTINGS
  // ============================================================================

  /**
   * Get all active listings (public)
   * Note: MarketListing has no relations in schema (creator, category, requests removed)
   */
  async findAllListings(categoryId?: string) {
    return this.prisma.marketListing.findMany({
      where: {
        status: ListingStatus.ACTIVE,
        ...(categoryId && { categoryId }),
      },
      orderBy: [
        // Note: isBoosted field removed from schema
        { createdAt: 'desc' },
      ],
    });
  }

  /**
   * Get a specific listing by ID
   * Note: viewCount field removed from schema
   */
  async findOneListing(id: string) {
    const listing = await this.prisma.marketListing.findUnique({
      where: { id },
    });

    if (!listing) {
      throw new NotFoundException('Listing not found');
    }

    // Note: viewCount field removed from MarketListing model
    return listing;
  }

  /**
   * Get creator's own listings
   */
  async findMyListings(creatorId: string) {
    return this.prisma.marketListing.findMany({
      where: { creatorId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Create a new listing
   */
  async createListing(creatorId: string, dto: CreateListingDto) {
    return this.prisma.marketListing.create({
      data: {
        id: randomUUID(),
        title: dto.title,
        description: dto.description,
        price: dto.price,
        mediaUrls: [],
        // priceMax, deliveryDays not in DTO - using schema defaults
        categoryId: dto.categoryId,
        status: (dto as any).status || ListingStatus.ACTIVE,
        currency: dto.currency || 'EUR',
        creatorId,
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Update a listing
   */
  async updateListing(id: string, creatorId: string, dto: UpdateListingDto) {
    const listing = await this.prisma.marketListing.findUnique({
      where: { id },
    });

    if (!listing) {
      throw new NotFoundException('Listing not found');
    }

    if (listing.creatorId !== creatorId) {
      throw new ForbiddenException('Not authorized to update this listing');
    }

    return this.prisma.marketListing.update({
      where: { id },
      data: {
        ...(dto.title && { title: dto.title }),
        ...(dto.description && { description: dto.description }),
        ...(dto.price && { price: dto.price }),
        ...(dto.categoryId !== undefined && { categoryId: dto.categoryId }),
        // priceMax, deliveryDays not in UpdateListingDto
        ...((dto as any).status && { status: (dto as any).status }),
      },
    });
  }

  /**
   * Delete a listing
   */
  async deleteListing(id: string, creatorId: string) {
    const listing = await this.prisma.marketListing.findUnique({
      where: { id },
    });

    if (!listing) {
      throw new NotFoundException('Listing not found');
    }

    if (listing.creatorId !== creatorId) {
      throw new ForbiddenException('Not authorized to delete this listing');
    }

    await this.prisma.marketListing.delete({
      where: { id },
    });

    return { message: 'Listing deleted successfully' };
  }

  // ============================================================================
  // REQUESTS - DISABLED (Request model not in schema)
  // ============================================================================

  /**
   * Get all requests (for a fan or creator)
   * NOTE: Request model doesn't exist in schema - this functionality is disabled
   */
  async findAllRequests(userId: string, role: 'fan' | 'creator') {
    // TODO: Implement Request model in Prisma schema
    return [];
  }

  /**
   * Get a specific request
   * NOTE: Request model doesn't exist in schema - this functionality is disabled
   */
  async findOneRequest(id: string, userId: string) {
    // TODO: Implement Request model in Prisma schema
    throw new NotFoundException('Request functionality not yet implemented');
  }

  /**
   * Create a new request
   * NOTE: Request model doesn't exist in schema - this functionality is disabled
   */
  async createRequest(fanId: string, dto: CreateRequestDto) {
    // TODO: Implement Request model in Prisma schema
    throw new NotFoundException('Request functionality not yet implemented');
  }

  /**
   * Update a request (creator only - for accepting/declining)
   * NOTE: Request model doesn't exist in schema - this functionality is disabled
   */
  async updateRequest(id: string, creatorId: string, dto: UpdateRequestDto) {
    // TODO: Implement Request model in Prisma schema
    throw new NotFoundException('Request functionality not yet implemented');
  }
}
