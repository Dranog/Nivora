import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { EmailService } from './email.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { createWriteStream } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { v4 as uuidv4 } from 'uuid';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

@Injectable()
export class CrmService {
  constructor(
    private emailService: EmailService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async addFanEmail(creatorId: string, email: string, source: string) {
    // Vérifier si email déjà présent
    const existing = await prisma.fanEmail.findUnique({
      where: { creatorId_email: { creatorId, email } },
    });

    if (existing) {
      if (existing.optIn) {
        throw new BadRequestException('Email already subscribed');
      }
      // Re-send confirmation si pas encore confirmé
    }

    // Générer token de confirmation (JWT 24h)
    const confirmToken = this.jwt.sign(
      { creatorId, email, event: 'opt-in' },
      { expiresIn: '24h' },
    );

    // Créer ou update FanEmail
    const fanEmail = await prisma.fanEmail.upsert({
      where: { creatorId_email: { creatorId, email } },
      create: {
        id: randomUUID(),
        updatedAt: new Date(),
        creatorId,
        email,
        source,
        optIn: false,
        confirmToken,
        consentTimestamp: new Date(),
        consentIp: source, // Should be actual IP
      },
      update: {
        confirmToken,
        updatedAt: new Date(),
      },
    });

    // Récupérer créateur pour nom
    const creator = await prisma.user.findUnique({
      where: { id: creatorId },
      include: { creatorProfile: true },
    });

    const creatorName = creator!.creatorProfile?.username || creator!.email.split('@')[0];

    // Envoyer email de confirmation
    await this.emailService.sendOptInConfirmation(email, creatorName, confirmToken);

    // Log dans AuditLog
    await prisma.auditLog.create({
      data: {
        id: randomUUID(),
        userId: creatorId,
        event: 'CRM_EMAIL_ADDED',
        resource: 'FanEmail',
        meta: { email, source },
      },
    });

    return { fanEmailId: fanEmail.id, status: 'PENDING_CONFIRMATION' };
  }

  async confirmOptIn(token: string) {
    let payload: any;

    try {
      payload = this.jwt.verify(token);
    } catch {
      throw new BadRequestException('Invalid or expired confirmation token');
    }

    if (payload.event !== 'opt-in') {
      throw new BadRequestException('Invalid token');
    }

    // Update FanEmail
    const fanEmail = await prisma.fanEmail.update({
      where: {
        creatorId_email: {
          creatorId: payload.creatorId,
          email: payload.email,
        },
      },
      data: {
        optIn: true,
        confirmedAt: new Date(),
        confirmToken: null,
      },
    });

    // Envoyer email de bienvenue
    const creator = await prisma.user.findUnique({
      where: { id: payload.creatorId },
      include: { creatorProfile: true },
    });

    const creatorName = creator!.creatorProfile?.username || creator!.email.split('@')[0];
    await this.emailService.sendWelcomeEmail(payload.email, creatorName);

    // Log
    await prisma.auditLog.create({
      data: {
        id: randomUUID(),
        userId: payload.creatorId,
        event: 'CRM_EMAIL_CONFIRMED',
        resource: 'FanEmail',
        meta: { email: payload.email },
      },
    });

    return { success: true, message: 'Subscription confirmed' };
  }

  async getFanEmails(
    creatorId: string,
    filters: { optIn?: boolean },
    pagination: { limit: number; offset: number },
  ) {
    const where: any = { creatorId };
    if (filters.optIn !== undefined) {
      where.optIn = filters.optIn;
    }

    const [emails, total] = await Promise.all([
      prisma.fanEmail.findMany({
        where,
        skip: pagination.offset,
        take: pagination.limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.fanEmail.count({ where }),
    ]);

    return { emails, total };
  }

  async exportEmails(creatorId: string) {
    const emails = await prisma.fanEmail.findMany({
      where: { creatorId, optIn: true },
      select: { email: true, source: true, confirmedAt: true },
    });

    // Générer CSV
    const csvPath = join(tmpdir(), `export-${uuidv4()}.csv`);
    const writeStream = createWriteStream(csvPath);

    writeStream.write('Email,Source,Confirmed At\n');
    emails.forEach(({ email, source, confirmedAt }) => {
      writeStream.write(`${email},${source || 'N/A'},${confirmedAt?.toISOString() || 'N/A'}\n`);
    });
    writeStream.end();

    // Log export
    await prisma.auditLog.create({
      data: {
        id: randomUUID(),
        userId: creatorId,
        event: 'CRM_EXPORT',
        resource: 'FanEmail',
        meta: { count: emails.length },
      },
    });

    // TODO: Upload to S3 and return signed URL
    return { csvPath, count: emails.length };
  }

  async unsubscribe(fanEmailId: string) {
    const fanEmail = await prisma.fanEmail.update({
      where: { id: fanEmailId },
      data: { optIn: false, unsubscribedAt: new Date() },
    });

    // Log
    await prisma.auditLog.create({
      data: {
        id: randomUUID(),
        userId: fanEmail.creatorId,
        event: 'CRM_UNSUBSCRIBE',
        resource: 'FanEmail',
        meta: { email: fanEmail.email },
      },
    });

    return { success: true };
  }

  async sendBulkEmail(
    creatorId: string,
    subject: string,
    htmlContent: string,
  ) {
    const emails = await prisma.fanEmail.findMany({
      where: { creatorId, optIn: true },
      select: { email: true },
    });

    if (emails.length === 0) {
      throw new BadRequestException('No subscribers found');
    }

    const creator = await prisma.user.findUnique({
      where: { id: creatorId },
      include: { creatorProfile: true },
    });

    const creatorName = creator!.creatorProfile?.username || creator!.email.split('@')[0];

    // Envoyer par batch de 100 (SendGrid limit)
    const batches = [];
    for (let i = 0; i < emails.length; i += 100) {
      batches.push(emails.slice(i, i + 100).map(e => e.email));
    }

    for (const batch of batches) {
      await this.emailService.sendBulkEmail(batch, subject, htmlContent, creatorName);
    }

    // Log
    await prisma.auditLog.create({
      data: {
        id: randomUUID(),
        userId: creatorId,
        event: 'CRM_BULK_EMAIL_SENT',
        resource: 'FanEmail',
        meta: { subject, recipientCount: emails.length },
      },
    });

    return { sent: emails.length };
  }
}
