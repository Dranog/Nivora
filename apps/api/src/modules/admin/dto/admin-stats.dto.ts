import { z } from 'zod';

/**
 * Admin Dashboard Stats Response
 */
export const adminStatsSchema = z.object({
  totalUsers: z.number().int().nonnegative(),
  newUsersToday: z.number().int().nonnegative(),
  usersTrend: z.number(), // percentage
  revenue: z.number().nonnegative(),
  revenueToday: z.number().nonnegative(),
  revenueTrend: z.number(),
  pendingPayouts: z.number().int().nonnegative(),
  pendingPayoutsAmount: z.number().nonnegative(),
  payoutsTrend: z.number(),
});

export type AdminStatsDto = z.infer<typeof adminStatsSchema>;

/**
 * Sales Overview Request
 */
export const salesOverviewQuerySchema = z.object({
  period: z.enum(['7d', '30d', '90d', '1y']).default('30d'),
});

export type SalesOverviewQueryDto = z.infer<typeof salesOverviewQuerySchema>;

/**
 * Sales Overview Response
 */
export const salesDataPointSchema = z.object({
  date: z.string(), // ISO date
  revenue: z.number(),
  subscriptions: z.number(),
  ppv: z.number(),
  tips: z.number(),
});

export const salesOverviewSchema = z.object({
  data: z.array(salesDataPointSchema),
  total: z.number(),
  average: z.number(),
  peak: salesDataPointSchema,
});

export type SalesDataPointDto = z.infer<typeof salesDataPointSchema>;
export type SalesOverviewDto = z.infer<typeof salesOverviewSchema>;

/**
 * Recent Transactions Request
 */
export const recentTransactionsQuerySchema = z.object({
  limit: z.number().int().min(1).max(100).default(10),
  offset: z.number().int().nonnegative().default(0),
});

export type RecentTransactionsQueryDto = z.infer<typeof recentTransactionsQuerySchema>;

/**
 * Transaction DTO
 */
export const transactionDtoSchema = z.object({
  id: z.string(),
  date: z.string(), // ISO date
  description: z.string(),
  type: z.enum(['subscription', 'ppv', 'tip', 'refund', 'payout']),
  amount: z.number(),
  status: z.enum(['completed', 'pending', 'failed', 'refunded']),
  user: z.object({
    id: z.string(),
    name: z.string(),
    avatar: z.string().nullable(),
  }).optional(),
});

export type TransactionDto = z.infer<typeof transactionDtoSchema>;

/**
 * Recent Transactions Response
 */
export const recentTransactionsSchema = z.object({
  transactions: z.array(transactionDtoSchema),
  total: z.number().int(),
  hasMore: z.boolean(),
});

export type RecentTransactionsDto = z.infer<typeof recentTransactionsSchema>;
