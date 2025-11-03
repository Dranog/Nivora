import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Enum of all auditable authentication events
 */
export enum AuditEvent {
  USER_REGISTERED = 'USER_REGISTERED',
  USER_LOGIN = 'USER_LOGIN',
  USER_LOGOUT = 'USER_LOGOUT',
  LOGIN_FAILED = 'LOGIN_FAILED',
  ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
  ACCOUNT_UNLOCKED = 'ACCOUNT_UNLOCKED',
  TOKEN_ROTATED = 'TOKEN_ROTATED',
  TOKEN_REVOKED = 'TOKEN_REVOKED',
  TOKEN_BLACKLISTED = 'TOKEN_BLACKLISTED',
  PASSWORD_CHANGED = 'PASSWORD_CHANGED',
  EMAIL_VERIFIED = 'EMAIL_VERIFIED',
  EMAIL_VERIFICATION_SENT = 'EMAIL_VERIFICATION_SENT',
  PASSWORD_RESET_REQUESTED = 'PASSWORD_RESET_REQUESTED',
  PASSWORD_RESET_COMPLETED = 'PASSWORD_RESET_COMPLETED',
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  UNAUTHORIZED_ACCESS_ATTEMPT = 'UNAUTHORIZED_ACCESS_ATTEMPT',
}

/**
 * Service responsible for logging authentication and security events
 * All events are stored in the database for audit trail and compliance
 */
@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  /**
   * Log an audit event to the database and console
   *
   * @param event - Type of event being logged
   * @param userId - ID of user associated with the event
   * @param metadata - Additional contextual information (IP, user agent, etc.)
   */
  async log(
    event: AuditEvent | string,
    userId: string,
    metadata?: Record<string, any>,
  ): Promise<void> {
    try {
      await prisma.auditLog.create({
        data: {
          id: randomUUID(),
          event,
          userId,
          meta: metadata || {},
        },
      });

      // Structured logging for monitoring systems
      this.logger.log(
        `[AUDIT] ${event} - User: ${userId}`,
        metadata ? JSON.stringify(metadata) : undefined,
      );
    } catch (error) {
      // Don't throw - audit logging should never break the main flow
      this.logger.error(`Failed to create audit log: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Log a security event (higher severity than regular audit)
   *
   * @param event - Type of security event
   * @param userId - ID of user associated with the event
   * @param metadata - Additional contextual information
   */
  async logSecurity(
    event: AuditEvent | string,
    userId: string,
    metadata?: Record<string, any>,
  ): Promise<void> {
    try {
      await prisma.auditLog.create({
        data: {
          id: randomUUID(),
          event,
          userId,
          meta: { ...metadata, severity: 'SECURITY' },
        },
      });

      // Use WARN level for security events
      this.logger.warn(
        `[SECURITY] ${event} - User: ${userId}`,
        metadata ? JSON.stringify(metadata) : undefined,
      );
    } catch (error) {
      this.logger.error(`Failed to create security log: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Retrieve audit logs for a specific user
   *
   * @param userId - User ID to retrieve logs for
   * @param limit - Maximum number of logs to return (default: 50)
   * @returns Array of audit logs
   */
  async getAuditLogs(userId: string, limit = 50) {
    return await prisma.auditLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  /**
   * Retrieve audit logs for a specific event type
   *
   * @param event - Event type to filter by
   * @param limit - Maximum number of logs to return (default: 100)
   * @returns Array of audit logs
   */
  async getAuditLogsByEvent(event: AuditEvent | string, limit = 100) {
    return await prisma.auditLog.findMany({
      where: { event },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  /**
   * Get count of specific events for a user within a time window
   * Useful for detecting suspicious patterns
   *
   * @param userId - User ID to check
   * @param event - Event type to count
   * @param windowMinutes - Time window in minutes (default: 60)
   * @returns Count of events
   */
  async getEventCount(
    userId: string,
    event: AuditEvent | string,
    windowMinutes = 60,
  ): Promise<number> {
    const since = new Date(Date.now() - windowMinutes * 60 * 1000);

    return await prisma.auditLog.count({
      where: {
        userId,
        event,
        createdAt: { gte: since },
      },
    });
  }
}
