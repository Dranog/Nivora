import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Injectable()
export class AnalyticsCacheService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async get<T>(key: string): Promise<T | null> {
    const result = await this.cacheManager.get<T>(key);
    return result ?? null;
  }

  async set(key: string, value: any, ttl: number): Promise<void> {
    await this.cacheManager.set(key, value, ttl * 1000);
  }

  async del(key: string): Promise<void> {
    await this.cacheManager.del(key);
  }

  async invalidateCreator(authorId: string): Promise<void> {
    // Invalidate all analytics caches for a creator
    const keys = [
      `overview:${authorId}`,
      `posts-stats:${authorId}`,
      `revenue-breakdown:${authorId}`,
    ];

    await Promise.all(keys.map(key => this.del(key)));
  }
}
