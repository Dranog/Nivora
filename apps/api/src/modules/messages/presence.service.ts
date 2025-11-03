import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

/**
 * Presence Service
 * Manages online/offline status using Redis cache with TTL
 */
@Injectable()
export class PresenceService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  /**
   * Mark user as online (60s TTL)
   */
  async setOnline(userId: string): Promise<void> {
    await this.cacheManager.set(`user:${userId}:online`, '1', 60000); // 60s
  }

  /**
   * Mark user as offline
   */
  async setOffline(userId: string): Promise<void> {
    await this.cacheManager.del(`user:${userId}:online`);
  }

  /**
   * Check if user is online
   */
  async isOnline(userId: string): Promise<boolean> {
    const result = await this.cacheManager.get<string>(`user:${userId}:online`);
    return result === '1';
  }

  /**
   * Heartbeat to keep user online
   * Should be called every 30s from client
   */
  async heartbeat(userId: string): Promise<void> {
    await this.setOnline(userId);
  }
}
