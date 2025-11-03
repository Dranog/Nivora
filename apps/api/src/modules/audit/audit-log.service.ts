// apps/api/src/modules/audit/audit-log.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../common/prisma/prisma.service';

interface AuditLogEntry {
  userId?: string;
  event: string;
  resource?: string;
  resourceId?: string;
  meta?: any;
  request?: any;
}

interface AuditLogResponse {
  id: string;
  createdAt: Date;
  userId: string | null;
  event: string;
  resource: string | null;
  meta: any;
  ipHash: string | null;
  ua: string | null;
}

@Injectable()
export class AuditLogService {
  private readonly logger = new Logger(AuditLogService.name);

  constructor(private readonly prisma: PrismaService) {}

  async log(entry: AuditLogEntry): Promise<AuditLogResponse> {
    try {
      const ipHash = this.extractIp(entry.request);
      const ua = this.extractUserAgent(entry.request);

      const auditLog = await this.prisma.auditLog.create({
        data: {
          id: randomUUID(),
          userId: entry.userId,
          event: entry.event,
          resource: entry.resource,
          meta: entry.meta || {},
          ipHash,
          ua,
        },
      });

      this.logger.log(
        `Audit log created: ${entry.event} by ${entry.userId || 'system'} on ${entry.resource || 'N/A'}`,
      );

      return {
        id: auditLog.id,
        createdAt: auditLog.createdAt,
        userId: auditLog.userId,
        event: auditLog.event,
        resource: auditLog.resource,
        meta: auditLog.meta,
        ipHash: auditLog.ipHash,
        ua: auditLog.ua,
      };
    } catch (error) {
      this.logger.error(`Failed to create audit log: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }

  private extractIp(request: any): string | null {
    if (!request) return null;
    return request.ip || request.headers?.['x-forwarded-for'] || request.connection?.remoteAddress || null;
  }

  private extractUserAgent(request: any): string | null {
    if (!request) return null;
    return request.headers?.['user-agent'] || null;
  }

  async getAuditLogs(filters: {
    userId?: string;
    event?: string;
    resource?: string;
    limit?: number;
    offset?: number;
  }) {
    const { userId, event, resource, limit = 50, offset = 0 } = filters;

    const where: any = {};
    if (userId) where.userId = userId;
    if (event) where.event = { contains: event, mode: 'insensitive' };
    if (resource) where.resource = resource;

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return { logs, total };
  }
}
