import {
  Injectable,
  Logger,
  InternalServerErrorException,
  Inject,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { PrismaClient, User, Role } from '@prisma/client';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { hashPassword, comparePassword } from '../../common/utils/hash.util';
import {
  generateAccessToken,
  generateRefreshToken,
} from '../../common/utils/token.util';
import { randomBytes, randomUUID } from 'crypto';
import {
  InvalidCredentialsException,
  EmailAlreadyExistsException,
  InvalidRefreshTokenException,
  SessionNotFoundException,
} from './exceptions/auth.exceptions';
import { AuditService, AuditEvent } from './services/audit.service';
import { AccountLockoutService } from './services/account-lockout.service';

const prisma = new PrismaClient();

/**
 * Service responsible for user authentication and authorization
 * Implements security best practices including:
 * - Account lockout on failed attempts
 * - JWT token rotation
 * - Token blacklisting
 * - Audit logging
 * - Timing attack prevention
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private auditService: AuditService,
    private accountLockoutService: AccountLockoutService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  /**
   * Register a new user account
   *
   * @param dto - Registration data including email, password, and role
   * @returns Auth tokens and user profile
   * @throws EmailAlreadyExistsException if email is already registered
   * @throws InternalServerErrorException if registration fails
   */
  async register(dto: RegisterDto) {
    try {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: dto.email },
      });

      if (existingUser) {
        this.logger.warn(`Registration attempt with existing email: ${dto.email}`);
        throw new EmailAlreadyExistsException();
      }

      // Hash password
      const hashedPassword = await hashPassword(dto.password);

      // Create user with transaction for atomicity
      const user = await prisma.$transaction(async (tx) => {
        const newUser = await tx.user.create({
          data: {
            id: randomUUID(),
            email: dto.email,
            username: dto.email.split('@')[0], // Generate username from email
            passwordHash: hashedPassword,
            role: dto.role as Role,
            updatedAt: new Date(),
          },
        });

        // If role is CREATOR, create CreatorProfile
        if (dto.role === Role.CREATOR) {
          await tx.creatorProfile.create({
            data: {
              id: randomUUID(),
              userId: newUser.id,
              username: this.generateUsername(dto.email),
            },
          });
        }

        return newUser;
      });

      this.logger.log(`User registered successfully: ${user.id}`);
      await this.auditService.log(AuditEvent.USER_REGISTERED, user.id, {
        email: user.email,
        role: user.role,
      });

      // Generate tokens
      return this.generateTokens(user);
    } catch (error) {
      if (error instanceof EmailAlreadyExistsException) {
        throw error;
      }
      this.logger.error(`Registration failed: ${error instanceof Error ? error.message : String(error)}`, error instanceof Error ? error.stack : undefined);
      throw new InternalServerErrorException('Registration failed');
    }
  }

  /**
   * Authenticate user and generate tokens
   * Implements timing attack prevention and account lockout
   *
   * @param dto - Login credentials
   * @param ip - IP address of the request
   * @returns Auth tokens and user profile
   * @throws InvalidCredentialsException if credentials are invalid
   * @throws AccountLockedException if account is locked
   */
  async login(dto: LoginDto, ip: string) {
    const startTime = Date.now();

    try {
      this.logger.debug(`[Login] Starting login for: ${dto.email}`);

      // Check account lockout first
      this.logger.debug('[Login] Checking account lockout...');
      await this.accountLockoutService.checkLockout(dto.email);

      // Find user
      this.logger.debug('[Login] Finding user in database...');
      const user = await prisma.user.findUnique({
        where: { email: dto.email },
      });
      this.logger.debug(`[Login] User found: ${!!user}`);

      // CONSTANT TIME COMPARISON - always hash even if user not found
      let isPasswordValid = false;
      if (user) {
        this.logger.debug('[Login] Comparing password...');
        isPasswordValid = await comparePassword(dto.password, user.passwordHash);
        this.logger.debug(`[Login] Password valid: ${isPasswordValid}`);
      } else {
        // Dummy hash to prevent timing attack
        this.logger.debug('[Login] User not found - running dummy hash');
        await hashPassword('dummy-password-to-maintain-timing');
      }

      // Add constant delay to prevent timing attacks
      const elapsed = Date.now() - startTime;
      const minDelay = 100; // 100ms minimum
      if (elapsed < minDelay) {
        await new Promise(resolve => setTimeout(resolve, minDelay - elapsed));
      }

      // Check credentials
      if (!user || !isPasswordValid) {
        this.logger.debug('[Login] Invalid credentials - recording failed attempt');
        await this.accountLockoutService.recordFailedAttempt(dto.email, ip);
        this.logger.warn(`Failed login attempt: ${dto.email} from ${ip}`);

        this.logger.debug('[Login] Logging failed attempt to audit...');
        await this.auditService.logSecurity(AuditEvent.LOGIN_FAILED, user?.id || 'unknown', {
          email: dto.email,
          ip,
        });
        throw new InvalidCredentialsException();
      }

      // Clear failed attempts on success
      this.logger.debug('[Login] Clearing failed attempts...');
      await this.accountLockoutService.clearFailedAttempts(dto.email);

      // Log successful login
      this.logger.log(`User logged in: ${user.id}`);
      this.logger.debug('[Login] Logging success to audit...');
      await this.auditService.log(AuditEvent.USER_LOGIN, user.id, {
        email: user.email,
        ip,
      });

      // Generate tokens
      this.logger.debug('[Login] Generating tokens...');
      const tokens = await this.generateTokens(user);
      this.logger.debug('[Login] ✅ Login successful!');
      return tokens;
    } catch (error) {
      if (error instanceof InvalidCredentialsException ||
          error instanceof Error && error.constructor.name === 'AccountLockedException') {
        throw error;
      }
      this.logger.error(`[Login] ❌ Login failed: ${error instanceof Error ? error.message : String(error)}`);
      this.logger.error(`[Login] Error stack:`, error instanceof Error ? error.stack : undefined);
      throw new InternalServerErrorException('Login failed');
    }
  }

  /**
   * Refresh access token using refresh token
   * Implements token rotation - old refresh token is blacklisted
   *
   * @param refreshToken - JWT refresh token
   * @param ip - IP address of the request
   * @returns New auth tokens
   * @throws InvalidRefreshTokenException if token is invalid or blacklisted
   * @throws SessionNotFoundException if session doesn't exist
   */
  async refresh(refreshToken: string, ip: string) {
    try {
      // Verify refresh token
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });

      // Check if token is blacklisted
      const isBlacklisted = await this.cacheManager.get(`blacklist:${payload.jti}`);
      if (isBlacklisted) {
        this.logger.warn(`Blacklisted token used: ${payload.jti}`);
        await this.auditService.logSecurity(AuditEvent.SUSPICIOUS_ACTIVITY, payload.sub, {
          reason: 'Blacklisted token reuse attempt',
          ip,
          jti: payload.jti,
        });
        throw new InvalidRefreshTokenException();
      }

      // Check if session exists
      const session = await prisma.session.findUnique({
        where: { jti: payload.jti },
      });

      if (!session) {
        this.logger.warn(`Session not found: ${payload.jti}`);
        throw new SessionNotFoundException();
      }

      // Check if session is expired
      if (session.expiresAt < new Date()) {
        await prisma.session.delete({ where: { jti: payload.jti } });
        await this.auditService.log(AuditEvent.SESSION_EXPIRED, payload.sub, { jti: payload.jti });
        throw new InvalidRefreshTokenException();
      }

      // Find user
      const user = await prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user) {
        this.logger.warn(`User not found for token refresh: ${payload.sub}`);
        throw new InvalidRefreshTokenException();
      }

      // Blacklist old refresh token (TOKEN ROTATION)
      await this.cacheManager.set(
        `blacklist:${payload.jti}`,
        '1',
        604800000, // 7 days in milliseconds
      );

      // Delete old session
      await prisma.session.delete({ where: { jti: payload.jti } });

      // Log token rotation
      this.logger.log(`Token rotated for user: ${user.id}`);
      await this.auditService.log(AuditEvent.TOKEN_ROTATED, user.id, {
        oldJti: payload.jti,
        ip,
      });

      // Generate new tokens
      return this.generateTokens(user);
    } catch (error) {
      if (error instanceof InvalidRefreshTokenException ||
          error instanceof SessionNotFoundException) {
        throw error;
      }
      this.logger.error(`Token refresh failed: ${error instanceof Error ? error.message : String(error)}`);
      throw new InvalidRefreshTokenException();
    }
  }

  /**
   * Logout user by invalidating session and blacklisting token
   *
   * @param jti - JWT token ID from the access token
   * @param userId - User ID from the authenticated request
   * @param ip - IP address of the request
   * @returns Success response
   */
  async logout(jti: string, userId: string, ip: string) {
    try {
      // Delete session
      await prisma.session.delete({ where: { jti } }).catch(() => {
        // Session might already be deleted, ignore error
      });

      // Blacklist the token
      await this.cacheManager.set(
        `blacklist:${jti}`,
        '1',
        604800000, // 7 days
      );

      // Log logout
      this.logger.log(`User logged out: ${userId}`);
      await this.auditService.log(AuditEvent.USER_LOGOUT, userId, { ip, jti });

      return { success: true };
    } catch (error) {
      this.logger.error(`Logout failed: ${error instanceof Error ? error.message : String(error)}`);
      throw new InternalServerErrorException('Logout failed');
    }
  }

  /**
   * Generate access and refresh tokens for user
   * Creates a new session in database
   *
   * @param user - User object
   * @returns Object containing tokens and user profile
   */
  private async generateTokens(user: User) {
    try {
      this.logger.debug(`[generateTokens] Starting for user: ${user.id}`);

      // Generate unique JTI
      const jti = randomBytes(16).toString('hex');
      this.logger.debug(`[generateTokens] JTI generated: ${jti}`);

      // Create payload
      const payload = {
        sub: user.id,
        email: user.email,
        role: user.role,
        jti,
      };
      this.logger.debug(`[generateTokens] Payload created`);

      // Generate tokens
      this.logger.debug(`[generateTokens] Generating access token...`);
      const accessToken = generateAccessToken(this.jwtService, payload);
      this.logger.debug(`[generateTokens] Access token generated: ${accessToken.substring(0, 20)}...`);

      this.logger.debug(`[generateTokens] Generating refresh token...`);
      const refreshToken = generateRefreshToken(this.jwtService, payload);
      this.logger.debug(`[generateTokens] Refresh token generated: ${refreshToken.substring(0, 20)}...`);

      // Calculate expiration date (7 days from now)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);
      this.logger.debug(`[generateTokens] Expiration date: ${expiresAt.toISOString()}`);

      // Create session
      this.logger.debug(`[generateTokens] Creating session in database...`);
      await prisma.session.create({
        data: {
          id: randomUUID(),
          userId: user.id,
          token: refreshToken,
          jti,
          expiresAt,
        },
      });
      this.logger.debug(`[generateTokens] Session created successfully`);

      // Get user with creatorProfile if exists
      this.logger.debug(`[generateTokens] Fetching user with profile...`);
      const userWithProfile = await prisma.user.findUnique({
        where: { id: user.id },
        include: { creatorProfile: true },
      });
      this.logger.debug(`[generateTokens] User profile fetched`);

      // Remove password from response
      const { passwordHash: _, ...userWithoutPassword } = userWithProfile!;

      this.logger.debug(`[generateTokens] ✅ Tokens generated successfully`);
      return {
        accessToken,
        refreshToken,
        user: userWithoutPassword,
      };
    } catch (error) {
      this.logger.error(`[generateTokens] ❌ Error: ${error instanceof Error ? error.message : String(error)}`);
      this.logger.error(`[generateTokens] Stack:`, error instanceof Error ? error.stack : undefined);
      throw error;
    }
  }

  /**
   * Generate unique username from email
   *
   * @param email - User email
   * @returns Generated username with random suffix
   */
  private generateUsername(email: string): string {
    const baseUsername = email.split('@')[0];
    const randomSuffix = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0');
    return `${baseUsername}${randomSuffix}`;
  }
}
