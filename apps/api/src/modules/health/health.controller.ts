import { Controller, Get } from '@nestjs/common';
import { HealthCheckService, HealthCheck } from '@nestjs/terminus';
import { PrismaHealthIndicator } from './indicators/prisma.health';
import { RedisHealthIndicator } from './indicators/redis.health';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private prismaHealth: PrismaHealthIndicator,
    private redisHealth: RedisHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.prismaHealth.isHealthy('database'),
      () => this.redisHealth.isHealthy('redis'),
    ]);
  }

  @Get('db')
  @HealthCheck()
  checkDatabase() {
    return this.health.check([
      () => this.prismaHealth.isHealthy('database'),
    ]);
  }

  @Get('redis')
  @HealthCheck()
  checkRedis() {
    return this.health.check([
      () => this.redisHealth.isHealthy('redis'),
    ]);
  }
}
