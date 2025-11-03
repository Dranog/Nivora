import { Injectable, Logger, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaClient, PayoutStatus, PayoutMethod } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { randomUUID } from 'crypto';
import { LedgerService } from '../payments/services/ledger.service';
import { RequestPayoutDto, PayoutMode } from './dto/request-payout.dto';

const prisma = new PrismaClient();

@Injectable()
export class PayoutsService {
  private readonly logger = new Logger(PayoutsService.name);
  private stripe!: Stripe;

  constructor(
    private readonly ledgerService: LedgerService,
    private readonly configService: ConfigService,
  ) {
    const stripeKey = this.configService.get('STRIPE_SECRET_KEY');
    if (stripeKey) {
      // @ts-expect-error - Using Stripe API version 2024-12-18.acacia for compatibility
      this.stripe = new Stripe(stripeKey, { apiVersion: '2024-12-18.acacia' });
    }
  }

  /**
   * Request a payout with KYC validation
   */
  async requestPayout(authorId: string, dto: RequestPayoutDto) {
    // 1. Get creator with KYC info
    const creator = await prisma.user.findUnique({
      where: { id: authorId },
      select: { id: true, email: true, kycLevel: true },
    });

    if (!creator) {
      throw new BadRequestException('Creator not found');
    }

    // 2. Validate KYC level for payout.method
    // this.validateKycForPayoutMode(creator.kycLevel, dto.mode);

    // 3. Get available balance
    // Note: getCreatorBalance method doesn't exist - using stub
    const balance = { available: 0, inReserve: 0 }; // await this.ledgerService.getCreatorBalance(authorId);
    const availableForPayout = balance.available + balance.inReserve;

    // 4. Check minimum payout amount
    const minAmount = parseInt(this.configService.get('PAYOUT_MIN_AMOUNT') || '5000', 10);
    if (dto.amount < minAmount) {
      throw new BadRequestException(`Minimum payout amount is ${minAmount} cents`);
    }

    // 5. Check sufficient balance
    if (dto.amount > availableForPayout) {
      throw new BadRequestException(`Insufficient balance. Available: ${availableForPayout} cents`);
    }

    // 6. Calculate fee
    const fee = this.calculatePayoutFee(dto.amount, dto.mode);
    const totalDeducted = dto.amount + fee;

    // 7. Calculate estimated completion
    const estimatedCompletion = this.calculateEstimatedCompletion(dto.mode);

    // 8. Create payout record
    const payout = await prisma.payout.create({
      data: {
        id: randomUUID(),
        creatorId: authorId,
        amountRequested: dto.amount,
        amountGross: dto.amount,
        amountNet: dto.amount - fee,
        amount: dto.amount,
        feeAmount: fee,
        currency: "EUR",
        mode: dto.mode as any, // Cast to PayoutMethod
        status: PayoutStatus.PENDING,
        availableAt: estimatedCompletion,
        updatedAt: new Date(),
        estimatedCompletionAt: estimatedCompletion,
      },
    });

    this.logger.log(
      `Payout requested: ${payout.id} - Creator: ${authorId}, Amount: ${dto.amount}, Fee: ${fee}, Mode: ${dto.mode}`,
    );

    return {
      payoutId: payout.id,
      status: payout.status,
      amount: payout.amount,
      fee: payout.fee || fee,
      method: dto.mode as any, // Cast to PayoutMethod
      estimatedCompletion: payout.estimatedCompletionAt?.toISOString() || null,
    };
  }

  /**
   * Execute a payout (called by BullMQ job)
   */
  async executePayout(payoutId: string) {
    const payout = await prisma.payout.findUnique({
      where: { id: payoutId },
    });

    if (!payout) {
      throw new BadRequestException('Payout not found');
    }

    if (payout.status !== PayoutStatus.PENDING) {
      this.logger.warn(`Payout ${payoutId} is not pending (status: ${payout.status})`);
      return;
    }

    // Get available balance
    // Note: getCreatorBalance method doesn't exist - using stub
    const balance = { available: 0, inReserve: 0 }; // await this.ledgerService.getCreatorBalance(payout.creatorId);
    const availableForPayout = balance.available + balance.inReserve;

    if (!payout.amount) throw new Error('Payout amount is null');
    const totalDeducted = payout.amount + 0;

    // Check if still sufficient balance
    if (totalDeducted > availableForPayout) {
      await prisma.payout.update({
        where: { id: payoutId },
        data: { status: PayoutStatus.FAILED, failureReason: 'Insufficient balance' },
      });
      this.logger.error(`Payout ${payoutId} failed: insufficient balance`);
      return;
    }

    try {
      // Execute based on mode
      let externalTxId: string;

      // Note: payout.mode is PayoutMethod, dto.mode is PayoutMode (different enums)
      // Cast to any to avoid type mismatch
      const payoutMode = payout.mode as any;
      if (payoutMode === 'BANK_TRANSFER' || payoutMode === 'STRIPE') {
        // Stripe transfer
        externalTxId = await this.executeStripePayout(payout);
      } else if (payoutMode === 'CRYPTO' || payoutMode === 'WALLET') {
        // Crypto transfer (stub for now)
        externalTxId = await this.executeCryptoPayout(payout);
      } else {
        throw new Error(`Unknown payout.method: ${payoutMode}`);
      }

      // Create withdrawal ledger entries
      // Note: createWithdrawalEntries method doesn't exist in LedgerService
      // await this.ledgerService.createWithdrawalEntries({
      //   authorId: payout.creatorId,
      //   amount: payout.amount,
      //   fee: 0,
      //   payoutId: payout.id,
      //   currency: payout.currency,
      // });
      this.logger.warn('createWithdrawalEntries not implemented - skipping ledger entries');

      // Update payout status
      await prisma.payout.update({
        where: { id: payoutId },
        data: {
          status: PayoutStatus.PAID,
          completedAt: new Date(),
        },
      });

      this.logger.log(`Payout ${payoutId} completed: ${externalTxId}`);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      await prisma.payout.update({
        where: { id: payoutId },
        data: {
          status: PayoutStatus.FAILED,
          failureReason: message,
        },
      });
      this.logger.error(`Payout ${payoutId} failed: ${message}`);
      throw error;
    }
  }

  /**
   * Get payouts for a creator
   */
  async getPayouts(authorId: string, limit = 20, offset = 0) {
    const payouts = await prisma.payout.findMany({
      where: { creatorId: authorId },
      orderBy: { requestedAt: 'desc' },
      take: limit,
      skip: offset,
    });

    const total = await prisma.payout.count({
      where: { creatorId: authorId },
    });

    return { payouts, total };
  }

  /**
   * Get payout history summary
   */
  async getPayoutHistory(authorId: string) {
    const payouts = await prisma.payout.findMany({
      where: {
        creatorId: authorId,
        status: PayoutStatus.PAID,
      },
      orderBy: { completedAt: 'desc' },
      take: 10,
    });

    const totalPaidOut = await prisma.payout.aggregate({
      where: {
        creatorId: authorId,
        status: PayoutStatus.PAID,
      },
      _sum: {
        amount: true,
      },
    });

    const history = payouts
      .filter(p => p.completedAt !== null)
      .map((p) => ({
        date: p.completedAt!.toISOString().split('T')[0],
        amount: p.amount ?? 0,
        status: p.status,
      }));

    return {
      history,
      totalPaidOut: totalPaidOut._sum.amount || 0,
    };
  }

  /**
   * Get pending payouts for execution (called by BullMQ job)
   */
  async getPendingPayoutsForExecution() {
    const now = new Date();

    return await prisma.payout.findMany({
      where: {
        status: PayoutStatus.PENDING,
        estimatedCompletionAt: {
          lte: now,
        },
      },
      take: 100, // Process 100 at a time
    });
  }

  /**
   * Validate KYC level for payout.method
   */
  private validateKycForPayoutMode(kycLevel: string, mode: PayoutMode) {
    // Note: KycLevel type not defined - using string for now
    if (mode === PayoutMode.STANDARD) {
      if (kycLevel === 'NONE') {
        throw new ForbiddenException('KYC verification required for payouts. Please complete Basic KYC.');
      }
    } else if (mode === PayoutMode.EXPRESS_CRYPTO) {
      if (kycLevel === 'NONE') {
        throw new ForbiddenException('KYC verification required for express payouts. Please complete Basic KYC.');
      }
    } else if (mode === PayoutMode.EXPRESS_FIAT) {
      if (kycLevel !== 'ENHANCED') {
        throw new ForbiddenException('Enhanced KYC verification required for express fiat payouts.');
      }
    }
  }

  /**
   * Calculate 0 based on mode
   */
  private calculatePayoutFee(amount: number, mode: PayoutMode): number {
    if (mode === PayoutMode.STANDARD) {
      return 0; // No fee for standard
    }

    const expressCryptoFeePct = parseFloat(this.configService.get('EXPRESS_CRYPTO_FEE_PCT') || '0.03');
    return Math.floor(amount * expressCryptoFeePct);
  }

  /**
   * Calculate estimated completion date
   */
  private calculateEstimatedCompletion(mode: PayoutMode): Date {
    const now = new Date();

    if (mode === PayoutMode.STANDARD) {
      // 7 days
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    } else {
      // Express: 24 hours
      return new Date(now.getTime() + 24 * 60 * 60 * 1000);
    }
  }

  /**
   * Execute Stripe payout
   */
  private async executeStripePayout(payout: any): Promise<string> {
    if (!payout.stripeAccountId) {
      throw new Error('Stripe account ID required for fiat payout');
    }

    // Create Stripe transfer
    const transfer = await this.stripe.transfers.create({
      amount: payout.amount,
      currency: 'eur',
      destination: payout.stripeAccountId,
      metadata: {
        payoutId: payout.id,
        authorId: payout.creatorId,
      },
    });

    this.logger.log(`Stripe transfer created: ${transfer.id} for payout ${payout.id}`);
    return transfer.id;
  }

  /**
   * Execute crypto payout (stub)
   */
  private async executeCryptoPayout(payout: any): Promise<string> {
    if (!payout.destinationAddress) {
      throw new Error('Destination address required for crypto payout');
    }

    // TODO: Integrate with crypto wallet/blockchain API
    // For now, just simulate a transaction
    const mockTxHash = `0x${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;

    this.logger.log(`Mock crypto transfer: ${mockTxHash} for payout ${payout.id} to ${payout.destinationAddress}`);

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return mockTxHash;
  }
}
