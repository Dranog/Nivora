import { z } from 'zod';

export const TransactionTypeSchema = z.enum([
  'subscription',
  'ppv',
  'tip',
  'marketplace',
  'refund',
]);

export type TransactionType = z.infer<typeof TransactionTypeSchema>;

export const TransactionStatusSchema = z.enum([
  'complete',
  'pending',
  'processing',
  'failed',
]);

export type TransactionStatus = z.infer<typeof TransactionStatusSchema>;

export const TransactionSchema = z.object({
  id: z.string(),
  type: TransactionTypeSchema,
  date: z.string(),
  from: z.object({
    name: z.string(),
    avatar: z.string(),
  }),
  amount: z.number(),
  status: TransactionStatusSchema,
  description: z.string().optional(),
});

export type Transaction = z.infer<typeof TransactionSchema>;

export const RevenueSourceSchema = z.object({
  name: z.string(),
  value: z.number(),
  amount: z.number(),
  color: z.string(),
  trend: z.number(),
});

export type RevenueSource = z.infer<typeof RevenueSourceSchema>;

export const RevenueEvolutionDataPointSchema = z.object({
  date: z.string(),
  revenus_bruts: z.number(),
  ppv_achats: z.number(),
  tips: z.number(),
  marketplace: z.number(),
});

export type RevenueEvolutionDataPoint = z.infer<typeof RevenueEvolutionDataPointSchema>;

export const UpcomingReleaseSchema = z.object({
  days: z.number(),
  amount: z.number(),
  status: z.enum(['released', 'pending']),
});

export type UpcomingRelease = z.infer<typeof UpcomingReleaseSchema>;
