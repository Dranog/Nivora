import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { CacheModule } from '@nestjs/cache-manager';
import { HealthController } from './health.controller';
import { PrismaHealthIndicator } from './indicators/prisma.health';
import { RedisHealthIndicator } from './indicators/redis.health';
import { PrismaService } from '../../common/prisma/prisma.service';

@Module({
  imports: [
    TerminusModule,
    CacheModule.register(),
  ],
  controllers: [HealthController],
  providers: [PrismaHealthIndicator, RedisHealthIndicator, PrismaService],
})
export class HealthModule {}
