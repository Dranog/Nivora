import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Injectable()
export class PublicCacheService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async get<T>(key: string): Promise<T | null> {
    const result = await this.cacheManager.get<T>(key);
    return result ?? null;
  }

  async set(key: string, value: any, ttl: number): Promise<void> {
    await this.cacheManager.set(key, value, ttl * 1000);
  }

  async invalidateCreator(username: string): Promise<void> {
    await this.cacheManager.del(`creator:${username}`);
    await this.cacheManager.del('trending'); // Invalidate trending too
  }
}
