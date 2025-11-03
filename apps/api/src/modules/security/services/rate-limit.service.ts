import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { randomUUID } from 'crypto';

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

@Injectable()
export class RateLimitService {
  private defaultConfigs: Record<string, RateLimitConfig> = {
    '/api/auth/login': { windowMs: 60000, maxRequests: 5 }, // 5 requests per minute
    '/api/auth/register': { windowMs: 3600000, maxRequests: 3 }, // 3 requests per hour
    '/api/admin': { windowMs: 60000, maxRequests: 100 }, // 100 requests per minute for admin
    'default': { windowMs: 60000, maxRequests: 60 }, // 60 requests per minute default
  };

  constructor(private prisma: PrismaService) {}

  /**
   * Check if request should be rate limited
   */
  async checkRateLimit(identifier: string, endpoint: string): Promise<{ allowed: boolean; remaining: number }> {
    const config = this.getConfig(endpoint);
    const windowStart = new Date(Math.floor(Date.now() / config.windowMs) * config.windowMs);

    // Find or create rate limit record
    const rateLimit = await this.prisma.rateLimit.findUnique({
      where: {
        identifier_endpoint_windowStart: {
          identifier,
          endpoint,
          windowStart,
        },
      },
    });

    if (!rateLimit) {
      // Create new rate limit record
      await this.prisma.rateLimit.create({
        data: {
          id: randomUUID(),
          updatedAt: new Date(),
          identifier,
          endpoint,
          windowStart,
          requestCount: 1,
          blocked: false,
        },
      });
      return { allowed: true, remaining: config.maxRequests - 1 };
    }

    // Check if blocked
    if (rateLimit.blocked || rateLimit.requestCount >= config.maxRequests) {
      return { allowed: false, remaining: 0 };
    }

    // Increment request count
    await this.prisma.rateLimit.update({
      where: {
        identifier_endpoint_windowStart: {
          identifier,
          endpoint,
          windowStart,
        },
      },
      data: {
        requestCount: { increment: 1 },
        blocked: rateLimit.requestCount + 1 >= config.maxRequests,
      },
    });

    return {
      allowed: true,
      remaining: Math.max(0, config.maxRequests - rateLimit.requestCount - 1),
    };
  }

  /**
   * Get rate limit config for endpoint
   */
  private getConfig(endpoint: string): RateLimitConfig {
    // Try exact match first
    if (this.defaultConfigs[endpoint]) {
      return this.defaultConfigs[endpoint];
    }

    // Try prefix match
    for (const [prefix, config] of Object.entries(this.defaultConfigs)) {
      if (endpoint.startsWith(prefix)) {
        return config;
      }
    }

    return this.defaultConfigs['default'];
  }

  /**
   * Clean up old rate limit records
   */
  async cleanup() {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago

    const result = await this.prisma.rateLimit.deleteMany({
      where: {
        windowStart: { lt: cutoff },
      },
    });

    return { deleted: result.count };
  }
}
