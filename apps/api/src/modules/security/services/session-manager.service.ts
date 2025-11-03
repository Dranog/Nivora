import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { randomUUID } from 'crypto';

@Injectable()
export class SessionManagerService {
  constructor(private prisma: PrismaService) {}

  /**
   * Log session activity
   */
  async logSession(
    userId: string,
    sessionId: string,
    ipAddress: string,
    action: string,
    userAgent?: string,
    success: boolean = true,
    failureReason?: string,
    metadata?: any,
  ) {
    await this.prisma.sessionLog.create({
      data: {
        id: randomUUID(),
        userId,
        sessionId,
        ipAddress,
        userAgent,
        action,
        success,
        failureReason,
        metadata,
      },
    });
  }

  /**
   * Get recent sessions for user
   */
  async getUserSessions(userId: string, limit: number = 50) {
    return this.prisma.sessionLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  /**
   * Get failed login attempts
   */
  async getFailedLogins(userId: string, since: Date) {
    return this.prisma.sessionLog.findMany({
      where: {
        userId,
        action: 'LOGIN',
        success: false,
        createdAt: { gte: since },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Check for suspicious activity (multiple failed logins from different IPs)
   */
  async detectSuspiciousActivity(userId: string): Promise<boolean> {
    const last15Minutes = new Date(Date.now() - 15 * 60 * 1000);

    const failedAttempts = await this.prisma.sessionLog.findMany({
      where: {
        userId,
        action: 'LOGIN',
        success: false,
        createdAt: { gte: last15Minutes },
      },
      select: { ipAddress: true },
    });

    // If more than 5 failed attempts from different IPs in 15 minutes
    const uniqueIPs = new Set(failedAttempts.map(a => a.ipAddress));
    return uniqueIPs.size >= 5;
  }

  /**
   * Terminate all sessions for user (force logout)
   */
  async terminateAllSessions(userId: string, adminId: string) {
    // Log session termination
    await this.logSession(
      userId,
      'admin-termination',
      'system',
      'SESSION_TERMINATED_BY_ADMIN',
      undefined,
      true,
      undefined,
      { terminatedBy: adminId },
    );

    // In production, also invalidate all JWT refresh tokens in Redis
    // await this.redisService.del(`user:${userId}:sessions:*`);

    // Log audit event
    await this.prisma.auditLog.create({
      data: {
        id: randomUUID(),
        userId: adminId,
        event: 'USER_SESSIONS_TERMINATED',
        resource: 'Security',
        meta: {
          targetUserId: userId,
          timestamp: new Date().toISOString(),
        },
      },
    });

    return { success: true };
  }

  /**
   * Clean up old session logs (retention policy)
   */
  async cleanup(retentionDays: number = 90) {
    const cutoff = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);

    const result = await this.prisma.sessionLog.deleteMany({
      where: {
        createdAt: { lt: cutoff },
      },
    });

    return { deleted: result.count };
  }
}
