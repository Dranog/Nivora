import { Injectable, Logger, Inject } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { AccountLockedException } from '../exceptions/auth.exceptions';
import { AuditService, AuditEvent } from './audit.service';

const prisma = new PrismaClient();

/**
 * Service responsible for account lockout mechanism
 * Protects against brute force and credential stuffing attacks
 *
 * Rules:
 * - Track failed login attempts per email address
 * - Lock account after MAX_ATTEMPTS (10 attempts)
 * - Lockout duration: LOCKOUT_DURATION (30 minutes)
 * - Failed attempts reset after 1 hour of inactivity
 */
@Injectable()
export class AccountLockoutService {
  private readonly logger = new Logger(AccountLockoutService.name);
  private readonly MAX_ATTEMPTS = 10;
  private readonly LOCKOUT_DURATION = 30 * 60 * 1000; // 30 minutes
  private readonly ATTEMPT_WINDOW = 60 * 60 * 1000; // 1 hour

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private auditService: AuditService,
  ) {}

  /**
   * Record a failed login attempt for an email address
   * If threshold is exceeded, lock the account
   *
   * @param email - Email address that failed login
   * @param ip - IP address of the failed attempt
   */
  async recordFailedAttempt(email: string, ip: string): Promise<void> {
    try {
      const key = `failed-login:${email}`;
      const currentAttempts = (await this.cacheManager.get<number>(key)) || 0;
      const newAttempts = currentAttempts + 1;

      // Store with 1 hour TTL
      await this.cacheManager.set(key, newAttempts, this.ATTEMPT_WINDOW);

      this.logger.warn(`Failed login attempt ${newAttempts}/${this.MAX_ATTEMPTS} for ${email} from ${ip}`);

      // Lock account if threshold exceeded
      if (newAttempts >= this.MAX_ATTEMPTS) {
        await this.lockAccount(email, ip, newAttempts);
      }
    } catch (error) {
      this.logger.error(`Error recording failed attempt: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Check if an account is currently locked
   * Throws AccountLockedException if account is locked
   *
   * @param email - Email address to check
   * @throws AccountLockedException if account is currently locked
   */
  async checkLockout(email: string): Promise<void> {
    try {
      // Note: lockedUntil field removed from User model - using cache-only lockout
      // Check cache for active lockout
      const lockKey = `account-locked:${email}`;
      const lockedUntil = await this.cacheManager.get<string>(lockKey);

      if (lockedUntil && new Date(lockedUntil) > new Date()) {
        this.logger.warn(`Locked account login attempt: ${email}`);
        throw new AccountLockedException(new Date(lockedUntil));
      }
    } catch (error) {
      if (error instanceof AccountLockedException) {
        throw error;
      }
      this.logger.error(`Error checking lockout: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Clear failed login attempts after successful login
   *
   * @param email - Email address to clear attempts for
   */
  async clearFailedAttempts(email: string): Promise<void> {
    try {
      const key = `failed-login:${email}`;
      await this.cacheManager.del(key);

      // Note: failedLoginAttempts field removed from User model
      // Lockout tracking is cache-only

      this.logger.log(`Cleared failed attempts for ${email}`);
    } catch (error) {
      this.logger.error(`Error clearing failed attempts: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Lock an account due to excessive failed attempts
   *
   * @param email - Email address to lock
   * @param ip - IP address of the triggering attempt
   * @param attempts - Number of failed attempts
   */
  private async lockAccount(email: string, ip: string, attempts: number): Promise<void> {
    try {
      const lockUntil = new Date(Date.now() + this.LOCKOUT_DURATION);

      // Store lockout in cache instead of database
      const lockKey = `account-locked:${email}`;
      await this.cacheManager.set(lockKey, lockUntil.toISOString(), this.LOCKOUT_DURATION);

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        this.logger.warn(`Attempted to lock non-existent user: ${email}`);
        return;
      }

      // Log security event
      await this.auditService.logSecurity(AuditEvent.ACCOUNT_LOCKED, user.id, {
        email,
        ip,
        attempts,
        lockUntil: lockUntil.toISOString(),
        reason: 'Excessive failed login attempts',
      });

      this.logger.warn(`Account locked: ${email} until ${lockUntil.toISOString()}`);
    } catch (error) {
      this.logger.error(`Error locking account: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Unlock an account (called when lock expires or manually unlocked)
   *
   * @param email - Email address to unlock
   */
  private async unlockAccount(email: string): Promise<void> {
    try {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) return;

      // Clear cache lockout
      const lockKey = `account-locked:${email}`;
      await this.cacheManager.del(lockKey);

      await this.clearFailedAttempts(email);

      await this.auditService.log(AuditEvent.ACCOUNT_UNLOCKED, user.id, { email });

      this.logger.log(`Account unlocked: ${email}`);
    } catch (error) {
      this.logger.error(`Error unlocking account: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Manually unlock an account (admin function)
   *
   * @param email - Email address to unlock
   */
  async manualUnlock(email: string): Promise<void> {
    await this.unlockAccount(email);
  }

  /**
   * Get current failed attempt count for an email
   *
   * @param email - Email address to check
   * @returns Number of failed attempts
   */
  async getFailedAttemptCount(email: string): Promise<number> {
    const key = `failed-login:${email}`;
    return (await this.cacheManager.get<number>(key)) || 0;
  }
}
