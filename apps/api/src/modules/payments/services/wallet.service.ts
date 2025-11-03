import { Injectable, Logger } from '@nestjs/common';
import { PrismaClient, Currency, TxKind, TxSide } from '@prisma/client';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

/**
 * WalletService - Manages creator wallet balances
 * Note: No CreatorWallet model exists - balances are calculated from LedgerEntry aggregations
 */
@Injectable()
export class WalletService {
  private readonly logger = new Logger(WalletService.name);

  /**
   * Get or create wallet balance for a creator
   * Calculates balance from LedgerEntry aggregations
   *
   * @param authorId - Creator user ID
   * @param currency - Currency (default EUR)
   * @returns Wallet balance object
   */
  async getOrCreateWallet(authorId: string, currency: Currency = Currency.EUR) {
    // Calculate available balance from ledger entries
    const result = await prisma.ledgerEntry.aggregate({
      where: {
        userId: authorId,
      },
      _sum: { amount: true },
    });

    const available = result?._sum?.amount || 0;

    this.logger.log(`Calculated wallet for creator ${authorId}: available=${available}`);

    return {
      id: `wallet-${authorId}`, // Virtual ID
      creatorId: authorId,
      userId: authorId,
      currency,
      available,
      inReserve: 0, // TODO: Calculate from ledger metadata
      pendingClear: 0, // TODO: Calculate from pending transactions
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  /**
   * Update balance via ledger entries
   * Note: Don't update wallet directly - create ledger entries instead
   *
   * @param authorId - Creator user ID
   * @param delta - Balance changes
   * @returns Updated wallet balance
   */
  async updateBalance(
    authorId: string,
    delta: { available?: number; inReserve?: number; pendingClear?: number },
  ) {
    // Create ledger entry for balance change
    if (delta.available) {
      const side = delta.available >= 0 ? TxSide.CREDIT : TxSide.DEBIT;
      await prisma.ledgerEntry.create({
        data: {
          id: randomUUID(),
          userId: authorId,
          kind: TxKind.FEE, // Manual adjustment
          side,
          amount: Math.abs(delta.available),
          updatedAt: new Date(),
        },
      });
    }

    this.logger.log(
      `Updated wallet for ${authorId} via ledger entry: delta=${JSON.stringify(delta)}`,
    );

    // Return updated balance
    return this.getOrCreateWallet(authorId);
  }
}
