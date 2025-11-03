import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaClient, ModerationStatus } from "@prisma/client";
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostWithMedia, PaginatedPostsResponse } from './dto/post-response.dto';
import xss from 'xss';

const prisma = new PrismaClient();

@Injectable()
export class PostsService {
  async create(userId: string, dto: CreatePostDto): Promise<PostWithMedia> {
    // Validate that if isPaid is true, price must be provided and > 0
    if (dto.isPaid && (!dto.price || dto.price <= 0)) {
      throw new BadRequestException(
        'Price must be provided and greater than 0 for paid posts',
      );
    }

    // Validate mediaIds ownership
    if (dto.mediaIds.length > 0) {
      const mediaCount = await prisma.media.count({
        where: {
          id: { in: dto.mediaIds },
          ownerId: userId,
          postId: null, // Ensure media is not already attached to another post
        },
      });

      if (mediaCount !== dto.mediaIds.length) {
        throw new BadRequestException(
          'Invalid media IDs or media already attached to another post',
        );
      }
    }

    // Sanitize caption
    const sanitizedCaption = dto.caption ? xss(dto.caption) : null;

    // Create post
    const post = await prisma.post.create({
      data: {
        id: randomUUID(),
        creatorId: userId,
        caption: sanitizedCaption,
        isPaid: dto.isPaid,
        price: dto.price,
        status: 'PUBLISHED',
        updatedAt: new Date(),
      },
      include: {
        media: true,
      },
    });

    // Update media to link them to the post
    if (dto.mediaIds.length > 0) {
      await prisma.media.updateMany({
        where: {
          id: { in: dto.mediaIds },
        },
        data: {
          postId: post.id,
        },
      });

      // Fetch the updated post with media
      return this.findOne(post.id, userId);
    }

    // Always refetch to ensure media array is properly typed
    return this.findOne(post.id, userId);
  }

  async findOne(postId: string, userId?: string): Promise<PostWithMedia> {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        media: true,
        user: {
          include: {
            creatorProfile: true,
          },
        },
      },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    // If post is free, return full content
    if (!post.isPaid) {
      return post;
    }

    // If no user provided, return teaser
    if (!userId) {
      return this.getTeaserVersion(post);
    }

    // If user is the creator, return full content
    if (post.creatorId === userId) {
      return post;
    }

    // Check if user has purchased the post
    const purchase = await prisma.purchase.findFirst({
      where: {
        fanId: userId,
        postId: post.id,
      },
    });

    if (purchase) {
      return post;
    }

    // Check if user has active subscription to the creator
    const subscription = await prisma.subscription.findFirst({
      where: {
        fanId: userId,
        creatorId: post.creatorId,
        status: 'ACTIVE',
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (subscription) {
      return post;
    }

    // Return teaser version
    return this.getTeaserVersion(post);
  }

  private getTeaserVersion(post: any): PostWithMedia {
    // Return limited media (first 2 items) and blurred preview indication
    return {
      ...post,
      media: post.media.slice(0, 2).map((m: any) => ({
        ...m,
        isTeaser: true,
      })),
      isTeaser: true,
    };
  }

  async findByCreator(
    creatorId: string,
    filters: { isPaid?: boolean },
    pagination: { page: number; limit: number },
  ): Promise<PaginatedPostsResponse> {
    const { page = 1, limit = 10 } = pagination;
    const skip = (page - 1) * limit;

    const where: any = {
      creatorId: creatorId,
      moderationStatus: ModerationStatus.APPROVED,
    };

    if (filters.isPaid !== undefined) {
      where.isPaid = filters.isPaid;
    }

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        include: {
          media: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.post.count({ where }),
    ]);

    return {
      posts,
      total,
      page,
      limit,
    };
  }

  async update(postId: string, dto: UpdatePostDto): Promise<PostWithMedia> {
    // Sanitize caption if provided
    const sanitizedCaption = dto.caption ? xss(dto.caption) : undefined;

    const post = await prisma.post.update({
      where: { id: postId },
      data: {
        caption: sanitizedCaption,
        // Note: status field removed - use moderationStatus if needed
      },
      include: {
        media: true,
      },
    });

    return post;
  }

  async delete(postId: string): Promise<{ success: boolean }> {
    // Soft delete: set status to ARCHIVED
    await prisma.post.update({
      where: { id: postId },
      data: {
        status: 'ARCHIVED',
      },
    });

    return { success: true };
  }
}
