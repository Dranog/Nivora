import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { CacheModule } from '@nestjs/cache-manager';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AuditService } from './services/audit.service';
import { AccountLockoutService } from './services/account-lockout.service';

/**
 * Authentication module
 * Provides user authentication, authorization, and session management
 * Includes security features like audit logging and account lockout
 */
@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'default-secret',
      signOptions: { expiresIn: '15m' },
    }),
    CacheModule.register(),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    AuditService,
    AccountLockoutService,
  ],
  exports: [AuthService],
})
export class AuthModule {}
