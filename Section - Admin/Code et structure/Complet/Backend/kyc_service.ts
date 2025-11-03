// apps/api/src/modules/admin/services/kyc.service.ts

import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { S3Service } from '../../storage/s3.service';
import { YotiService } from '../../kyc-provider/yoti.service';
import { EmailService } from '../../email/email.service';
import { AuditLogService } from './audit-log.service';
import { ModerationGateway } from '../gateways/moderation.gateway';

@Injectable()
export class KycService {
  private readonly logger = new Logger(KycService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly s3: S3Service,
    private readonly yoti: YotiService,
    private readonly email: EmailService,
    private readonly auditLog: AuditLogService,
    private readonly moderationGateway: ModerationGateway,
  ) {}

  async getPending(cursor?: string, limit: number = 50) {
    const verifications = await this.prisma.kycVerification.findMany({
      where: { status: 'PENDING' },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            avatar: true,
            createdAt: true,
          },
        },
      },
    });

    const hasMore = verifications.length > limit;
    const items = hasMore ? verifications.slice(0, -1) : verifications;
    const nextCursor = hasMore ? items[items.length - 1].id : null;

    const itemsWithUrls = await Promise.all(
      items.map(async (kyc) => {
        const documents = await this.getSignedDocumentUrls(kyc.documentKeys as any);
        return {
          ...kyc,
          documents,
          documentKeys: undefined,
        };
      }),
    );

    return {
      items: itemsWithUrls,
      nextCursor,
      hasMore,
    };
  }

  async getById(id: string) {
    const verification = await this.prisma.kycVerification.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            avatar: true,
            createdAt: true,
          },
        },
        reviewedBy: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });

    if (!verification) {
      throw new NotFoundException('KYC verification not found');
    }

    const documents = await this.getSignedDocumentUrls(verification.documentKeys as any);

    return {
      ...verification,
      documents,
      documentKeys: undefined,
    };
  }

  async approve(id: string, reviewerId: string, req: any) {
    const verification = await this.prisma.kycVerification.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!verification) {
      throw new NotFoundException('KYC verification not found');
    }

    if (verification.status !== 'PENDING') {
      throw new BadRequestException('KYC verification already processed');
    }

    const updated = await this.prisma.kycVerification.update({
      where: { id },
      data: {
        status: 'VERIFIED',
        reviewedById: reviewerId,
        reviewedAt: new Date(),
      },
      include: { user: true },
    });

    await this.prisma.user.update({
      where: { id: verification.userId },
      data: { emailVerified: true },
    });

    await this.email.sendKycApprovalEmail(verification.user);

    await this.auditLog.log({
      actorId: reviewerId,
      action: 'kyc.approve',
      targetType: 'kycVerification',
      targetId: id,
      metadata: { userId: verification.userId },
      request: req,
    });

    this.moderationGateway.emitKycUpdate(id, 'VERIFIED', {
      userId: verification.userId,
      username: verification.user.username,
    });

    this.logger.log(`KYC approved: ${id} for user ${verification.userId}`);

    return { success: true, verification: updated };
  }

  async reject(id: string, reason: string, reviewerId: string, req: any) {
    const verification = await this.prisma.kycVerification.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!verification) {
      throw new NotFoundException('KYC verification not found');
    }

    if (verification.status !== 'PENDING') {
      throw new BadRequestException('KYC verification already processed');
    }

    const updated = await this.prisma.kycVerification.update({
      where: { id },
      data: {
        status: 'REJECTED',
        reviewedById: reviewerId,
        reviewedAt: new Date(),
        rejectionReason: reason,
      },
      include: { user: true },
    });

    await this.email.sendKycRejectionEmail(verification.user, reason);

    await this.auditLog.log({
      actorId: reviewerId,
      action: 'kyc.reject',
      targetType: 'kycVerification',
      targetId: id,
      metadata: { userId: verification.userId, reason },
      request: req,
    });

    this.moderationGateway.emitKycUpdate(id, 'REJECTED', {
      userId: verification.userId,
      username: verification.user.username,
      reason,
    });

    this.logger.log(`KYC rejected: ${id} for user ${verification.userId}`);

    return { success: true, verification: updated };
  }

  async handleWebhook(payload: any) {
    try {
      const { sessionId, status, userId } = this.parseWebhookPayload(payload);

      const verification = await this.prisma.kycVerification.findFirst({
        where: {
          externalId: sessionId,
          userId,
        },
      });

      if (!verification) {
        this.logger.warn(`KYC verification not found for session ${sessionId}`);
        return;
      }

      if (status === 'completed') {
        const scores = await this.yoti.getSessionResults(sessionId);

        await this.prisma.kycVerification.update({
          where: { id: verification.id },
          data: {
            aiScores: scores,
            status: 'UNDER_REVIEW',
          },
        });

        this.moderationGateway.emitKycUpdate(verification.id, 'UNDER_REVIEW', {
          userId: verification.userId,
          scores,
        });

        this.logger.log(`KYC webhook processed: ${sessionId}`);
      }
    } catch (error) {
      this.logger.error('Failed to process KYC webhook', error);
      throw error;
    }
  }

  private parseWebhookPayload(payload: any): { sessionId: string; status: string; userId: string } {
    const sessionId = payload.session_id || payload.sessionId || payload.id;
    const status = payload.status || payload.state;
    const userId = payload.user_tracking_id || payload.userTrackingId || payload.userId;

    if (!sessionId || !status || !userId) {
      throw new BadRequestException('Invalid webhook payload');
    }

    return { sessionId, status, userId };
  }

  private async getSignedDocumentUrls(documentKeys: any): Promise<any> {
    if (!documentKeys) return {};

    const urls: any = {};

    for (const [key, s3Key] of Object.entries(documentKeys)) {
      if (s3Key) {
        urls[key] = await this.s3.getSignedUrl(s3Key as string, 300);
      }
    }

    return urls;
  }

  async createSession(userId: string) {
    try {
      const sessionId = await this.yoti.createSession(userId);

      const verification = await this.prisma.kycVerification.create({
        data: {
          userId,
          provider: 'yoti',
          externalId: sessionId,
          status: 'PENDING',
          documents: {},
          documentKeys: {},
          personalData: {},
          aiScores: {},
          expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        },
      });

      this.logger.log(`KYC session created: ${sessionId} for user ${userId}`);

      return { sessionId, verificationId: verification.id };
    } catch (error) {
      this.logger.error('Failed to create KYC session', error);
      throw error;
    }
  }
}
