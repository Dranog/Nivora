import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { SecurityController } from './security.controller';
import { TwoFactorService } from './services/two-factor.service';
import { IPWhitelistService } from './services/ip-whitelist.service';
import { RateLimitService } from './services/rate-limit.service';
import { GeoBlockingService } from './services/geo-blocking.service';
import { SessionManagerService } from './services/session-manager.service';
import { IPWhitelistGuard } from './guards/ip-whitelist.guard';
import { RateLimitGuard } from './guards/rate-limit.guard';
import { PrismaService } from '../../common/prisma/prisma.service';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '15m' },
    }),
  ],
  controllers: [SecurityController],
  providers: [
    // Services
    TwoFactorService,
    IPWhitelistService,
    RateLimitService,
    GeoBlockingService,
    SessionManagerService,
    PrismaService,

    // Guards
    IPWhitelistGuard,
    RateLimitGuard,
  ],
  exports: [
    TwoFactorService,
    IPWhitelistService,
    RateLimitService,
    GeoBlockingService,
    SessionManagerService,
    IPWhitelistGuard,
    RateLimitGuard,
  ],
})
export class SecurityModule {}
