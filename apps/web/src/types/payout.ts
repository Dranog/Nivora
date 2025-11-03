/**
 * Payout Types - F3 Zod Schemas
 */

import { z } from 'zod';

// Payout status
export const payoutStatusSchema = z.enum([
  'pending',
  'processing',
  'paid',
  'failed',
  'canceled',
]);
export type PayoutStatus = z.infer<typeof payoutStatusSchema>;

// Payout method
export const payoutMethodSchema = z.enum(['bank_transfer', 'paypal', 'stripe']);
export type PayoutMethod = z.infer<typeof payoutMethodSchema>;

// Payout schema
export const payoutSchema = z.object({
  id: z.string(),
  creatorId: z.string(),
  amount: z.number(), // in cents
  currency: z.string().default('USD'),
  status: payoutStatusSchema,
  method: payoutMethodSchema,
  destination: z.string(), // account identifier
  description: z.string().optional(),
  requestedAt: z.string().datetime(),
  processedAt: z.string().datetime().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime().optional(),
});

export type Payout = z.infer<typeof payoutSchema>;

// Request payout input
export const requestPayoutInputSchema = z.object({
  amount: z.number().min(1000, 'Minimum payout is $10.00'), // in cents
  method: payoutMethodSchema,
  destination: z.string().min(1, 'Destination is required'),
  description: z.string().optional(),
});

export type RequestPayoutInput = z.infer<typeof requestPayoutInputSchema>;

// Payout balance response
export const payoutBalanceSchema = z.object({
  available: z.number(), // in cents
  pending: z.number(), // in cents
  currency: z.string().default('USD'),
});

export type PayoutBalance = z.infer<typeof payoutBalanceSchema>;

// Payout history response
export const payoutHistorySchema = z.object({
  data: z.array(payoutSchema),
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
});

export type PayoutHistory = z.infer<typeof payoutHistorySchema>;
