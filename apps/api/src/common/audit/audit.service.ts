import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async log(data: {
    userId?: string;
    event: string;
    resource?: string;
    meta?: any;
    ipHash?: string;
    ua?: string;
    // Legacy fields for compatibility
    action?: string;
    resourceType?: string;
    resourceId?: string;
    metadata?: any;
  }) {
    return this.prisma.auditLog.create({
      data: {
        id: randomUUID(),
        userId: data.userId,
        event: data.action || data.event,
        resource: data.resourceType || data.resource,
        meta: data.metadata || data.meta,
        ipHash: data.ipHash,
        ua: data.ua,
      },
    });
  }
}
