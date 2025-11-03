import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole as Role, Prisma } from '@prisma/client';
import { PrismaService } from '../../../common/prisma/prisma.service';
import {
  auditQuerySchema,
  type AuditQuery,
  type AuditListResponseDto,
} from '../dto/audit.dto';

@Controller('admin/audit')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AuditController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async getAuditLogs(@Query() rawQuery: any): Promise<AuditListResponseDto> {
    const query = auditQuerySchema.parse({
      page: rawQuery.page ? parseInt(rawQuery.page, 10) : 1,
      limit: rawQuery.limit ? parseInt(rawQuery.limit, 10) : 50,
      userId: rawQuery.userId,
      action: rawQuery.action,
      resource: rawQuery.resourceType,
      startDate: rawQuery.startDate,
      endDate: rawQuery.endDate,
      sortOrder: rawQuery.sortOrder || 'desc',
    });

    const where: Prisma.AuditLogWhereInput = {};
    if (query.userId) where.userId = query.userId;
    if (query.action) where.event = { contains: query.action, mode: 'insensitive' };
    if (query.resource) where.resource = query.resource;
    if (query.startDate || query.endDate) {
      where.createdAt = {};
      if (query.startDate) where.createdAt.gte = new Date(query.startDate);
      if (query.endDate) where.createdAt.lte = new Date(query.endDate);
    }

    const total = await this.prisma.auditLog.count({ where });
    const skip = (query.page - 1) * query.limit;
    const totalPages = Math.ceil(total / query.limit);

    const logs = await this.prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: query.sortOrder },
      skip,
      take: query.limit,
      include: { user: { select: { id: true, username: true, email: true } } },
    });

    const items = logs.map((log) => ({
      id: log.id,
      userId: log.userId || '',
      user: log.user || { id: '', username: '', email: '' },
      action: log.event,
      resource: log.resource,
      metadata: log.meta,
      ipAddress: log.ipHash,
      userAgent: log.ua,
      createdAt: log.createdAt.toISOString(),
    }));

    return { items, total, page: query.page, limit: query.limit, totalPages };
  }
}
