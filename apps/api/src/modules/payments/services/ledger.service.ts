import { Injectable, Logger } from '@nestjs/common';
import { PrismaClient, TxKind, TxSide } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

interface CreateEntryDto {
  userId: string;
  type: string; // SUBSCRIPTION, PPV_PURCHASE, TIP, etc.
  amountCents: number;
  description?: string;
  metadata?: any;
}

@Injectable()
export class LedgerService {
  private readonly logger = new Logger(LedgerService.name);

  constructor(private readonly configService: ConfigService) {}

  async createEntry(data: CreateEntryDto) {
    // Map transaction type to TxKind enum
    const kindMap: Record<string, TxKind> = {
      'SUBSCRIPTION': TxKind.SUBSCRIPTION,
      'SUBSCRIPTION_REVENUE': TxKind.SUBSCRIPTION,
      'PPV_PURCHASE': TxKind.PPV,
      'PPV_PURCHASE_REVENUE': TxKind.PPV,
      'TIP': TxKind.TIP,
      'TIP_REVENUE': TxKind.TIP,
      'PLATFORM_FEE': TxKind.FEE,
    };

    const kind = kindMap[data.type] || TxKind.FEE;
    const side = data.amountCents >= 0 ? TxSide.CREDIT : TxSide.DEBIT;

    const entry = await prisma.ledgerEntry.create({
      data: {
        id: randomUUID(),
        userId: data.userId,
        kind,
        side,
        amount: Math.abs(data.amountCents), // Amount in cents (always positive)
        updatedAt: new Date(),
      },
    });

    this.logger.log(`Created ledger entry: ${entry.id} - ${data.type} ${data.amountCents / 100} EUR`);
    return entry;
  }

  async createPaymentEntries(data: {
    fanId: string;
    authorId: string;
    amountCents: number;
    type: string;
    referenceId: string;
  }) {
    const platformTakePct = parseFloat(this.configService.get('PLATFORM_TAKE_PCT') || '0.10');
    const reservePct = parseFloat(this.configService.get('RESERVE_PCT') || '0.10');
    const platformFee = Math.floor(data.amountCents * platformTakePct);
    const creatorTotal = data.amountCents - platformFee;
    const creatorReserve = Math.floor(creatorTotal * (reservePct / 100));
    const creatorMain = creatorTotal - creatorReserve;

    const entries = [];
    entries.push(
      await this.createEntry({
        userId: data.fanId,
        type: data.type,
        amountCents: -data.amountCents,
        description: `Payment for ${data.type}`,
        metadata: { referenceId: data.referenceId },
      }),
    );
    entries.push(
      await this.createEntry({
        userId: data.authorId,
        type: `${data.type}_REVENUE`,
        amountCents: creatorMain,
        description: `Revenue from ${data.type} (main)`,
        metadata: { referenceId: data.referenceId, split: 'main', reservePct },
      }),
    );
    if (creatorReserve > 0) {
      entries.push(
        await this.createEntry({
          userId: data.authorId,
          type: `${data.type}_REVENUE`,
          amountCents: creatorReserve,
          description: `Revenue from ${data.type} (reserve)`,
          metadata: { referenceId: data.referenceId, split: 'reserve', reservePct },
        }),
      );
    }
    entries.push(
      await this.createEntry({
        userId: 'platform',
        type: 'PLATFORM_FEE',
        amountCents: platformFee,
        description: `Platform fee from ${data.type}`,
        metadata: { referenceId: data.referenceId, sourceUserId: data.fanId, targetUserId: data.authorId },
      }),
    );
    return entries;
  }

  async createSubscriptionEntries(subscriptionId: string, fanId: string, authorId: string, amountCents: number) {
    return this.createPaymentEntries({ fanId, authorId, amountCents, type: 'SUBSCRIPTION', referenceId: subscriptionId });
  }

  async createPPVEntries(purchaseId: string, fanId: string, authorId: string, amountCents: number) {
    return this.createPaymentEntries({ fanId, authorId, amountCents, type: 'PPV_PURCHASE', referenceId: purchaseId });
  }

  async createTipEntries(tipId: string, fanId: string, authorId: string, amountCents: number) {
    return this.createPaymentEntries({ fanId, authorId, amountCents, type: 'TIP', referenceId: tipId });
  }

  async getUserEntries(userId: string, limit = 50, offset = 0) {
    const entries = await prisma.ledgerEntry.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: limit, skip: offset });
    return entries;
  }

  async getUserBalance(userId: string) {
    const result = await prisma.ledgerEntry.aggregate({ _sum: { amount: true } });
    return result._sum.amount || 0;
  }

  async getCreatorRevenue(authorId: string, days = 30) {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const result = await prisma.ledgerEntry.aggregate({
      where: { userId: authorId, createdAt: { gte: since } },
      _sum: { amount: true },
    });
    return result?._sum?.amount || 0;
  }
}
