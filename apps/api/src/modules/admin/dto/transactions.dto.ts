import { z } from 'zod';

// Enums from schema
export enum TransactionType {
  PURCHASE = 'PURCHASE',
  SUBSCRIPTION = 'SUBSCRIPTION',
  TIP = 'TIP',
  PAYOUT = 'PAYOUT',
  REFUND = 'REFUND',
  CHARGEBACK = 'CHARGEBACK',
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
  DISPUTED = 'DISPUTED',
}

export enum PaymentMethod {
  CARD = 'CARD',
  BANK_TRANSFER = 'BANK_TRANSFER',
  WALLET = 'WALLET',
  CRYPTO = 'CRYPTO',
}

// ============================================================================
// Query & Filter Schemas
// ============================================================================

export const transactionsQuerySchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  type: z.nativeEnum(TransactionType).optional(),
  status: z.nativeEnum(TransactionStatus).optional(),
  paymentMethod: z.nativeEnum(PaymentMethod).optional(),
  userId: z.string().optional(),
  authorId: z.string().optional(),
  dateFrom: z.string().optional(), // ISO date
  dateTo: z.string().optional(), // ISO date
  minAmount: z.number().nonnegative().optional(),
  maxAmount: z.number().nonnegative().optional(),
  sortBy: z.enum(['createdAt', 'amount', 'type', 'status']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type TransactionsQuery = z.infer<typeof transactionsQuerySchema>;

// ============================================================================
// Transaction DTOs
// ============================================================================

export const transactionUserSchema = z.object({
  id: z.string(),
  username: z.string(),
  email: z.string(),
  avatar: z.string().nullable(),
});

export type TransactionUserDto = z.infer<typeof transactionUserSchema>;

export const transactionSchema = z.object({
  id: z.string(),
  type: z.nativeEnum(TransactionType),
  status: z.nativeEnum(TransactionStatus),
  amount: z.number(),
  currency: z.string().default('USD'),
  fee: z.number().nonnegative(),
  netAmount: z.number(),

  // Participants
  userId: z.string(),
  user: transactionUserSchema,
  authorId: z.string().nullable(),
  creator: transactionUserSchema.nullable(),

  // Payment details
  paymentMethod: z.nativeEnum(PaymentMethod),
  paymentIntentId: z.string().nullable(),
  paymentProvider: z.string().nullable(),
  last4: z.string().nullable(),

  // Metadata
  description: z.string().nullable(),
  metadata: z.record(z.string(), z.any()).nullable(),
  failureReason: z.string().nullable(),

  // Timestamps
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  completedAt: z.string().datetime().nullable(),
});

export type TransactionDto = z.infer<typeof transactionSchema>;

export const transactionsListResponseSchema = z.object({
  items: z.array(transactionSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
});

export type TransactionsListResponseDto = z.infer<typeof transactionsListResponseSchema>;

// ============================================================================
// Transaction Detail Schema
// ============================================================================

export const transactionDetailSchema = transactionSchema.extend({
  // Related transactions (refunds, chargebacks)
  relatedTransactions: z.array(
    z.object({
      id: z.string(),
      type: z.nativeEnum(TransactionType),
      status: z.nativeEnum(TransactionStatus),
      amount: z.number(),
      createdAt: z.string().datetime(),
    })
  ),

  // Payment provider details
  providerDetails: z.any().nullable(),

  // Audit trail
  auditLog: z.array(
    z.object({
      id: z.string(),
      action: z.string(),
      performedBy: z.object({
        id: z.string(),
        username: z.string(),
      }),
      timestamp: z.string().datetime(),
      metadata: z.any().nullable(),
    })
  ),
});

export type TransactionDetailDto = z.infer<typeof transactionDetailSchema>;

// ============================================================================
// Transaction Stats Schema
// ============================================================================

export const transactionStatsSchema = z.object({
  totalTransactions: z.number().int().nonnegative(),
  totalVolume: z.number().nonnegative(),
  totalFees: z.number().nonnegative(),

  // By status
  pendingCount: z.number().int().nonnegative(),
  completedCount: z.number().int().nonnegative(),
  failedCount: z.number().int().nonnegative(),
  refundedCount: z.number().int().nonnegative(),
  disputedCount: z.number().int().nonnegative(),

  // By type
  purchaseVolume: z.number().nonnegative(),
  subscriptionVolume: z.number().nonnegative(),
  tipVolume: z.number().nonnegative(),

  // Recent activity
  todayVolume: z.number().nonnegative(),
  weekVolume: z.number().nonnegative(),
  monthVolume: z.number().nonnegative(),

  // Averages
  averageTransactionAmount: z.number().nonnegative(),
  averageProcessingTime: z.number().nonnegative(), // in minutes
});

export type TransactionStatsDto = z.infer<typeof transactionStatsSchema>;

// ============================================================================
// Action Schemas
// ============================================================================

export const refundTransactionSchema = z.object({
  reason: z.string().min(10).max(1000),
  amount: z.number().positive().optional(), // partial refund
  notifyUser: z.boolean().default(true),
});

export type RefundTransactionDto = z.infer<typeof refundTransactionSchema>;

export const cancelTransactionSchema = z.object({
  reason: z.string().min(10).max(1000),
});

export type CancelTransactionDto = z.infer<typeof cancelTransactionSchema>;
