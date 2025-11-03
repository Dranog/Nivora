import { Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus';
import type { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';

@Injectable()
export class RedisHealthIndicator extends HealthIndicator {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      // Test cache read/write
      const testKey = 'health-check';
      const testValue = 'ok';
      await this.cacheManager.set(testKey, testValue, 1000);
      const result = await this.cacheManager.get(testKey);

      if (result === testValue) {
        return this.getStatus(key, true);
      }
      throw new Error('Cache read/write test failed');
    } catch (error) {
      throw new HealthCheckError('Redis check failed', this.getStatus(key, false));
    }
  }
}
