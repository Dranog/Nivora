import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { AnalyticsCacheService } from './cache/analytics-cache.service';
import { PrismaService } from '../../common/prisma/prisma.service';

@Module({
  imports: [
    CacheModule.register({
      ttl: 60, // default 60s
      max: 100, // max items in cache
    }),
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService, AnalyticsCacheService, PrismaService],
  exports: [AnalyticsService, AnalyticsCacheService],
})
export class AnalyticsModule {}
