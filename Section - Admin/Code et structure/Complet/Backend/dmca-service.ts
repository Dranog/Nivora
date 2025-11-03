// apps/api/src/modules/admin/legal/services/dmca.service.ts

import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { AuditLogService } from '../../core/services/audit-log.service';
import { EmailService } from '../../../integrations/email/email.service';

interface GetDmcaFilters {
  status?: string;
  cursor?: string;
  limit?: number;
}

interface CreateDmcaDto {
  copyrightHolder: string;
  contactEmail: string;
  contactAddress: string;
  workDescription: string;
  infringingUrl: string;
  goodFaithStatement: boolean;
  accuracyStatement: boolean;
  signature: string;
}

interface ProcessDmcaDto {
  contentId: string;
  contentType: string;
  action: 'TAKEDOWN' | 'DISMISS';
  notes?: string;
}

interface SubmitCounterNoticeDto {
  dmcaId: string;
  reason: string;
  goodFaithStatement: boolean;
  accuracyStatement: boolean;
  signature: string;
  contactInfo: string;
}

@Injectable()
export class DmcaService {
  private readonly logger = new Logger(DmcaService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService,
    private readonly email: EmailService,
  ) {}

  async findAll(filters: GetDmcaFilters) {
    const { status, cursor, limit = 50 } = filters;

    const where: any = {};
    if (status && status !== 'ALL') where.status = status;

    const requests = await this.prisma.dmcaRequest.findMany({
      where,
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: { createdAt: 'desc' },
    });

    const hasMore = requests.length > limit;
    const items = hasMore ? requests.slice(0, -1) : requests;
    const nextCursor = hasMore ? items[items.length - 1].id : null;

    return {
      items,
      nextCursor,
      hasMore,
    };
  }

  async findById(id: string) {
    const request = await this.prisma.dmcaRequest.findUnique({
      where: { id },
    });

    if (!request) {
      throw new NotFoundException('DMCA request not found');
    }

    return request;
  }

  async create(dto: CreateDmcaDto, adminId?: string) {
    // Validate statements
    if (!dto.goodFaithStatement || !dto.accuracyStatement) {
      throw new BadRequestException('Both good faith and accuracy statements must be true');
    }

    const dmcaRequest = await this.prisma.dmcaRequest.create({
      data: {
        copyrightHolder: dto.copyrightHolder,
        contactEmail: dto.contactEmail,
        contactAddress: dto.contactAddress,
        workDescription: dto.workDescription,
        infringingUrl: dto.infringingUrl,
        goodFaithStatement: dto.goodFaithStatement,
        accuracyStatement: dto.accuracyStatement,
        signature: dto.signature,
        signatureDate: new Date(),
        status: 'RECEIVED',
      },
    });

    this.logger.log(`DMCA request ${dmcaRequest.id} created`);

    // Send acknowledgment email
    await this.email.sendDmcaAcknowledgmentEmail({
      email: dto.contactEmail,
      name: dto.copyrightHolder,
      requestId: dmcaRequest.id,
    });

    return dmcaRequest;
  }

  async process(id: string, dto: ProcessDmcaDto, adminId: string, request: any) {
    const dmcaRequest = await this.prisma.dmcaRequest.findUnique({
      where: { id },
    });

    if (!dmcaRequest) {
      throw new NotFoundException('DMCA request not found');
    }

    if (dmcaRequest.status !== 'RECEIVED' && dmcaRequest.status !== 'UNDER_REVIEW') {
      throw new BadRequestException(`DMCA request is already ${dmcaRequest.status.toLowerCase()}`);
    }

    if (dto.action === 'TAKEDOWN') {
      // Disable the infringing content
      await this.disableContent(dto.contentId, dto.contentType);

      // Update DMCA request
      const updatedRequest = await this.prisma.dmcaRequest.update({
        where: { id },
        data: {
          status: 'TAKEDOWN',
          contentId: dto.contentId,
          contentType: dto.contentType,
          contentDisabledAt: new Date(),
          notes: dto.notes,
          updatedAt: new Date(),
        },
      });

      // Log action
      await this.auditLog.log({
        actorId: adminId,
        action: 'dmca.takedown',
        targetType: 'dmca',
        targetId: id,
        metadata: {
          contentId: dto.contentId,
          contentType: dto.contentType,
          notes: dto.notes,
        },
        request,
      });

      // Notify content owner
      await this.notifyContentOwner(dto.contentId, dto.contentType, dmcaRequest);

      // Start counter-notice period (10-14 days)
      const counterNoticePeriodEnd = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

      this.logger.log(`DMCA takedown processed for request ${id}`);

      return {
        success: true,
        request: updatedRequest,
        counterNoticePeriodEnd,
      };
    } else {
      // Dismiss request
      const updatedRequest = await this.prisma.dmcaRequest.update({
        where: { id },
        data: {
          status: 'RESOLVED',
          notes: dto.notes,
          updatedAt: new Date(),
        },
      });

      // Log action
      await this.auditLog.log({
        actorId: adminId,
        action: 'dmca.dismiss',
        targetType: 'dmca',
        targetId: id,
        metadata: {
          reason: 'dismissed',
          notes: dto.notes,
        },
        request,
      });

      this.logger.log(`DMCA request ${id} dismissed`);

      return {
        success: true,
        request: updatedRequest,
      };
    }
  }

  async submitCounterNotice(dto: SubmitCounterNoticeDto, userId: string, request: any) {
    const dmcaRequest = await this.prisma.dmcaRequest.findUnique({
      where: { id: dto.dmcaId },
    });

    if (!dmcaRequest) {
      throw new NotFoundException('DMCA request not found');
    }

    if (dmcaRequest.status !== 'TAKEDOWN') {
      throw new BadRequestException('Can only submit counter-notice for takedown requests');
    }

    if (dmcaRequest.counterNotice) {
      throw new BadRequestException('Counter-notice already submitted');
    }

    // Validate statements
    if (!dto.goodFaithStatement || !dto.accuracyStatement) {
      throw new BadRequestException('Both good faith and accuracy statements must be true');
    }

    // Update DMCA request with counter-notice
    const updatedRequest = await this.prisma.dmcaRequest.update({
      where: { id: dto.dmcaId },
      data: {
        status: 'COUNTER_NOTICE_PERIOD',
        counterNotice: true,
        counterNoticeAt: new Date(),
        counterNoticeBy: userId,
        counterNoticeReason: dto.reason,
        updatedAt: new Date(),
      },
    });

    // Log action
    await this.auditLog.log({
      actorId: userId,
      action: 'dmca.counter_notice',
      targetType: 'dmca',
      targetId: dto.dmcaId,
      metadata: {
        reason: dto.reason,
        contactInfo: dto.contactInfo,
      },
      request,
    });

    // Notify copyright holder
    await this.email.sendCounterNoticeNotification({
      email: dmcaRequest.contactEmail,
      name: dmcaRequest.copyrightHolder,
      requestId: dmcaRequest.id,
      counterNoticeReason: dto.reason,
    });

    this.logger.log(`Counter-notice submitted for DMCA request ${dto.dmcaId} by user ${userId}`);

    // Schedule automatic restoration after 10-14 days if no legal action
    const restorationDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

    return {
      success: true,
      request: updatedRequest,
      restorationDate,
      message: 'Counter-notice submitted. Content will be restored in 14 days unless copyright holder files legal action.',
    };
  }

  async restore(id: string, adminId: string, request: any) {
    const dmcaRequest = await this.prisma.dmcaRequest.findUnique({
      where: { id },
    });

    if (!dmcaRequest) {
      throw new NotFoundException('DMCA request not found');
    }

    if (dmcaRequest.status !== 'COUNTER_NOTICE_PERIOD') {
      throw new BadRequestException('Can only restore during counter-notice period');
    }

    if (!dmcaRequest.contentId || !dmcaRequest.contentType) {
      throw new BadRequestException('No content to restore');
    }

    // Re-enable the content
    await this.enableContent(dmcaRequest.contentId, dmcaRequest.contentType);

    // Update DMCA request
    const updatedRequest = await this.prisma.dmcaRequest.update({
      where: { id },
      data: {
        status: 'RESTORED',
        restoredAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // Log action
    await this.auditLog.log({
      actorId: adminId,
      action: 'dmca.restore',
      targetType: 'dmca',
      targetId: id,
      metadata: {
        contentId: dmcaRequest.contentId,
        contentType: dmcaRequest.contentType,
      },
      request,
    });

    this.logger.log(`Content restored for DMCA request ${id}`);

    return {
      success: true,
      request: updatedRequest,
    };
  }

  private async disableContent(contentId: string, contentType: string) {
    if (contentType === 'POST') {
      await this.prisma.post.update({
        where: { id: contentId },
        data: {
          moderationStatus: 'REJECTED',
          deletedAt: new Date(),
        },
      });
    } else if (contentType === 'VIDEO') {
      await this.prisma.video.update({
        where: { id: contentId },
        data: {
          moderationStatus: 'REJECTED',
          deletedAt: new Date(),
        },
      });
    }
  }

  private async enableContent(contentId: string, contentType: string) {
    if (contentType === 'POST') {
      await this.prisma.post.update({
        where: { id: contentId },
        data: {
          moderationStatus: 'APPROVED',
          deletedAt: null,
        },
      });
    } else if (contentType === 'VIDEO') {
      await this.prisma.video.update({
        where: { id: contentId },
        data: {
          moderationStatus: 'APPROVED',
          deletedAt: null,
        },
      });
    }
  }

  private async notifyContentOwner(contentId: string, contentType: string, dmcaRequest: any) {
    let ownerId: string | undefined;

    if (contentType === 'POST') {
      const post = await this.prisma.post.findUnique({
        where: { id: contentId },
        select: { authorId: true },
      });
      ownerId = post?.authorId;
    } else if (contentType === 'VIDEO') {
      const video = await this.prisma.video.findUnique({
        where: { id: contentId },
        select: { authorId: true },
      });
      ownerId = video?.authorId;
    }

    if (ownerId) {
      const user = await this.prisma.user.findUnique({
        where: { id: ownerId },
        select: { email: true, username: true },
      });

      if (user) {
        await this.email.sendDmcaTakedownNotification({
          email: user.email,
          username: user.username,
          contentType,
          contentId,
          dmcaRequestId: dmcaRequest.id,
        });
      }
    }
  }

  async getStatistics() {
    const [received, underReview, takedown, counterNotice, restored, resolved] = await Promise.all([
      this.prisma.dmcaRequest.count({ where: { status: 'RECEIVED' } }),
      this.prisma.dmcaRequest.count({ where: { status: 'UNDER_REVIEW' } }),
      this.prisma.dmcaRequest.count({ where: { status: 'TAKEDOWN' } }),
      this.prisma.dmcaRequest.count({ where: { status: 'COUNTER_NOTICE_PERIOD' } }),
      this.prisma.dmcaRequest.count({ where: { status: 'RESTORED' } }),
      this.prisma.dmcaRequest.count({ where: { status: 'RESOLVED' } }),
    ]);

    return {
      received,
      underReview,
      takedown,
      counterNotice,
      restored,
      resolved,
      total: received + underReview + takedown + counterNotice + restored + resolved,
    };
  }
}
