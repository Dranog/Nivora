import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { Prisma, AuditLog } from '@prisma/client';
import { Parser } from 'json2csv';
import dayjs from 'dayjs';
import * as crypto from 'crypto';

interface FindAuditLogParams {
  dateFrom?: string;
  dateTo?: string;
  userId?: string;
  event?: string;
  page: number;
  pageSize: number;
}

interface ExportAuditLogParams {
  dateFrom?: string;
  dateTo?: string;
  userId?: string;
  event?: string;
}

interface CreateAuditEntryParams {
  userId: string;
  event: string;
  resource?: string;
  meta?: Record<string, any>;
}

@Injectable()
export class AuditLogService {
  private readonly logger = new Logger(AuditLogService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Retourne une liste paginée des journaux d'audit.
   */
  async find(params: FindAuditLogParams) {
    const { dateFrom, dateTo, userId, event, page, pageSize } = params;

    const where: Prisma.AuditLogWhereInput = {};
    if (userId) where.userId = userId;
    if (event) where.event = event;
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) where.createdAt.lte = new Date(dateTo);
    }

    try {
      const [items, total] = await this.prisma.$transaction([
        this.prisma.auditLog.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * pageSize,
          take: pageSize,
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true,
                avatar: true,
              },
            },
          },
        }),
        this.prisma.auditLog.count({ where }),
      ]);

      return { items, total };
    } catch (e) {
      this.logger.error(`Erreur de récupération des logs: ${(e as Error).message}`);
      throw new InternalServerErrorException('Erreur interne lors de la récupération des journaux.');
    }
  }

  /**
   * Exporte les journaux filtrés au format CSV.
   */
  async exportCsv(params: ExportAuditLogParams): Promise<Buffer> {
    const { dateFrom, dateTo, userId, event } = params;
    const where: Prisma.AuditLogWhereInput = {};

    if (userId) where.userId = userId;
    if (event) where.event = event;
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) where.createdAt.lte = new Date(dateTo);
    }

    try {
      const logs = await this.prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true,
              avatar: true,
            },
          },
        },
      });

      if (!logs.length) {
        const empty = 'Aucun journal à exporter pour ces filtres.\n';
        return Buffer.from(empty, 'utf-8');
      }

      const formatted = logs.map((log) => ({
        ID: log.id,
        Utilisateur: log.user?.username || log.user?.email || 'Système',
        'ID Utilisateur': log.userId || 'N/A',
        Action: log.event,
        Ressource: log.resource || 'N/A',
        IP: log.ipHash ? `${log.ipHash.substring(0, 10)}...` : 'N/A',
        'User Agent': log.ua || 'N/A',
        Date: dayjs(log.createdAt).format('YYYY-MM-DD HH:mm:ss'),
        Métadonnées: log.meta ? JSON.stringify(log.meta) : '',
      }));

      const parser = new Parser({ fields: Object.keys(formatted[0]) });
      const csv = parser.parse(formatted);
      return Buffer.from(csv, 'utf-8');
    } catch (e) {
      this.logger.error(`Erreur d'export CSV: ${(e as Error).message}`);
      throw new InternalServerErrorException("Impossible d'exporter les journaux d'audit.");
    }
  }

  /**
   * Crée une entrée d'audit.
   * Compatible avec l'interface utilisée par les autres services.
   */
  async log(data: CreateAuditEntryParams): Promise<AuditLog> {
    const payload: Prisma.AuditLogCreateInput = {
      id: crypto.randomUUID(),
      user: data.userId ? { connect: { id: data.userId } } : undefined,
      event: data.event,
      resource: data.resource || null,
      meta: data.meta || {},
    };

    try {
      const created = await this.prisma.auditLog.create({ data: payload });
      this.logger.log(`Audit enregistré: ${created.event} par ${data.userId}`);
      return created;
    } catch (e) {
      this.logger.error(`Erreur lors de la création du log: ${(e as Error).message}`);
      throw new InternalServerErrorException("Impossible d'enregistrer le journal d'audit.");
    }
  }

  /**
   * Alias pour compatibilité avec l'ancien code.
   */
  async createAuditEntry(data: {
    actorId: string;
    actor: string;
    actorAvatar?: string;
    actionType: string;
    targetType?: string;
    targetId?: string;
    ip?: string;
    metadata?: Record<string, any>;
  }): Promise<AuditLog> {
    return this.log({
      userId: data.actorId,
      event: data.actionType,
      resource: data.targetType,
      meta: {
        ...data.metadata,
        targetId: data.targetId,
      },
    });
  }
}
