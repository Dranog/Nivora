import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { PublicController } from './public.controller';
import { PublicService } from './public.service';
import { PublicCacheService } from './cache/public-cache.service';
import { PrismaService } from '../../common/prisma/prisma.service';

@Module({
  imports: [
    CacheModule.register({
      ttl: 300, // 5min for public pages
      max: 100,
    }),
  ],
  controllers: [PublicController],
  providers: [PublicService, PublicCacheService, PrismaService],
  exports: [PublicService, PublicCacheService],
})
export class PublicModule {}
