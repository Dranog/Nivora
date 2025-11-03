import { Injectable, UnauthorizedException, Inject, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { PrismaClient } from '@prisma/client';
import { AccountSuspendedException } from '../exceptions/auth.exceptions';

const prisma = new PrismaClient();

/**
 * JWT authentication strategy
 * Validates JWT tokens and enriches request with user data
 * Implements additional security checks:
 * - Token blacklist verification
 * - Session validation
 * - User status checking (banned/suspended)
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(
    private configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET') || 'default-secret',
    });
  }

  /**
   * Validate JWT token payload and enrich with user data
   * Performs additional security checks beyond token signature validation
   *
   * @param payload - Decoded JWT payload
   * @returns User object with JTI for request context
   * @throws UnauthorizedException if token is invalid, blacklisted, or user is suspended
   */
  async validate(payload: any) {
    try {
      // Check if token is blacklisted (logout/refresh)
      const isBlacklisted = await this.cacheManager.get(`blacklist:${payload.jti}`);
      if (isBlacklisted) {
        this.logger.warn(`Blacklisted token used: ${payload.jti} for user: ${payload.sub}`);
        throw new UnauthorizedException('Token has been revoked');
      }

      // Check if session exists and is valid
      const session = await prisma.session.findUnique({
        where: { jti: payload.jti },
      });

      if (!session || session.expiresAt < new Date()) {
        this.logger.warn(`Invalid or expired session: ${payload.jti}`);
        throw new UnauthorizedException('Session expired or invalid');
      }

      // Find user and check status
      const user = await prisma.user.findUnique({
        where: { id: payload.sub },
        include: { creatorProfile: true },
      });

      if (!user) {
        this.logger.warn(`User not found for valid token: ${payload.sub}`);
        throw new UnauthorizedException('User not found');
      }

      // Check if user is banned or suspended
      if (user.status === 'BANNED') {
        this.logger.warn(`Banned user attempted access: ${user.id}`);
        throw new AccountSuspendedException('Your account has been permanently banned');
      }

      if (user.status === 'SUSPENDED') {
        this.logger.warn(`Suspended user attempted access: ${user.id}`);
        throw new AccountSuspendedException('Your account is temporarily suspended');
      }

      // Check if account is locked
//       if (user.lockedUntil && user.lockedUntil > new Date()) {
//         this.logger.warn(`Locked account access attempt: ${user.id}`);
//         throw new UnauthorizedException('Account is temporarily locked');
//       }

      // Return user with JTI from payload for logout/session management
      return {
        ...user,
        jti: payload.jti,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException || error instanceof AccountSuspendedException) {
        throw error;
      }
      this.logger.error(`JWT validation failed: ${error instanceof Error ? error.message : String(error)}`);
      throw new UnauthorizedException('Authentication failed');
    }
  }
}
