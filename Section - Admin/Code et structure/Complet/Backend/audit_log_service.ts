// apps/api/src/modules/admin/services/audit-log.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { createHash } from 'crypto';

interface AuditLogEntry {
  actorId: string;
  action: string;
  targetType: string;
  targetId?: string;
  metadata?: any;
  request?: any;
}

interface AuditLogResponse {
  id: string;
  timestamp: Date;
  actorId: string;
  action: string;
  targetType: string;
  targetId: string | null;
  metadata: any;
  ip: string;
  userAgent: string;
  device: string;
  hash: string;
  prevHash: string | null;
}

@Injectable()
export class AuditLogService {
  private readonly logger = new Logger(AuditLogService.name);

  constructor(private readonly prisma: PrismaService) {}

  async log(entry: AuditLogEntry): Promise<AuditLogResponse> {
    try {
      const ip = this.extractIp(entry.request);
      const userAgent = this.extractUserAgent(entry.request);
      const device = this.parseDevice(userAgent);

      const lastLog = await this.prisma.auditLog.findFirst({
        orderBy: { timestamp: 'desc' },
        select: { hash: true },
      });

      const payload = {
        timestamp: new Date().toISOString(),
        actorId: entry.actorId,
        action: entry.action,
        targetType: entry.targetType,
        targetId: entry.targetId || null,
        metadata: entry.metadata || {},
        ip,
        userAgent,
        device,
      };

      const currentHash = this.computeAuditHash(payload);
      const chainedData = this.chainAuditHash(lastLog?.hash || null, currentHash);

      const auditLog = await this.prisma.auditLog.create({
        data: {
          actorId: entry.actorId,
          action: entry.action,
          targetType: entry.targetType,
          targetId: entry.targetId || null,
          metadata: entry.metadata || {},
          ip,
          userAgent,
          device,
          hash: chainedData.hash,
          prevHash: chainedData.prevHash,
        },
      });

      this.logger.log(
        `Audit log created: ${entry.action} by ${entry.actorId} on ${entry.targetType}:${entry.targetId || 'N/A'}`,
      );

      return auditLog as AuditLogResponse;
    } catch (error) {
      this.logger.error('Failed to create audit log', error);
      throw error;
    }
  }

  computeAuditHash(payload: any): string {
    const normalized = JSON.stringify(payload, Object.keys(payload).sort());
    return createHash('sha256').update(normalized).digest('hex');
  }

  chainAuditHash(prevHash: string | null, currentHash: string): { hash: string; prevHash: string | null } {
    if (!prevHash) {
      return {
        hash: currentHash,
        prevHash: null,
      };
    }

    const chainedInput = `${prevHash}:${currentHash}`;
    const chainedHash = createHash('sha256').update(chainedInput).digest('hex');

    return {
      hash: chainedHash,
      prevHash,
    };
  }

  async verifyChain(limit: number = 1000): Promise<{ valid: boolean; brokenAt?: string }> {
    try {
      const logs = await this.prisma.auditLog.findMany({
        orderBy: { timestamp: 'asc' },
        take: limit,
      });

      if (logs.length === 0) {
        return { valid: true };
      }

      for (let i = 0; i < logs.length; i++) {
        const log = logs[i];
        
        if (i === 0) {
          if (log.prevHash !== null) {
            return { valid: false, brokenAt: log.id };
          }
        } else {
          const prevLog = logs[i - 1];
          if (log.prevHash !== prevLog.hash) {
            return { valid: false, brokenAt: log.id };
          }
        }

        const payload = {
          timestamp: log.timestamp.toISOString(),
          actorId: log.actorId,
          action: log.action,
          targetType: log.targetType,
          targetId: log.targetId,
          metadata: log.metadata,
          ip: log.ip,
          userAgent: log.userAgent,
          device: log.device,
        };

        const computedHash = this.computeAuditHash(payload);
        const expectedHash = this.chainAuditHash(log.prevHash, computedHash).hash;

        if (log.hash !== expectedHash) {
          return { valid: false, brokenAt: log.id };
        }
      }

      return { valid: true };
    } catch (error) {
      this.logger.error('Failed to verify audit chain', error);
      throw error;
    }
  }

  async findAll(filters: {
    actorId?: string;
    action?: string;
    targetType?: string;
    targetId?: string;
    from?: Date;
    to?: Date;
    cursor?: string;
    limit?: number;
  }) {
    const { actorId, action, targetType, targetId, from, to, cursor, limit = 50 } = filters;

    const where: any = {};

    if (actorId) where.actorId = actorId;
    if (action) where.action = { contains: action };
    if (targetType) where.targetType = targetType;
    if (targetId) where.targetId = targetId;
    if (from || to) {
      where.timestamp = {};
      if (from) where.timestamp.gte = from;
      if (to) where.timestamp.lte = to;
    }

    const logs = await this.prisma.auditLog.findMany({
      where,
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: { timestamp: 'desc' },
      include: {
        actor: {
          select: {
            id: true,
            username: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    const hasMore = logs.length > limit;
    const items = hasMore ? logs.slice(0, -1) : logs;
    const nextCursor = hasMore ? items[items.length - 1].id : null;

    return {
      items,
      nextCursor,
      hasMore,
    };
  }

  private extractIp(request: any): string {
    if (!request) return 'unknown';
    return (
      request.headers['x-forwarded-for']?.split(',')[0] ||
      request.headers['x-real-ip'] ||
      request.connection?.remoteAddress ||
      request.socket?.remoteAddress ||
      'unknown'
    );
  }

  private extractUserAgent(request: any): string {
    if (!request) return 'unknown';
    return request.headers['user-agent'] || 'unknown';
  }

  private parseDevice(userAgent: string): string {
    if (userAgent === 'unknown') return 'unknown';

    const ua = userAgent.toLowerCase();

    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
      return 'mobile';
    }
    if (ua.includes('tablet') || ua.includes('ipad')) {
      return 'tablet';
    }
    return 'desktop';
  }
}
