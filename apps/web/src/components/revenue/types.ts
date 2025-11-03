import { z } from 'zod';

export const TransactionTypeSchema = z.enum([
  'subscription',
  'ppv',
  'tip',
  'marketplace',
]);

export type TransactionType = z.infer<typeof TransactionTypeSchema>;

export const TransactionStatusSchema = z.enum([
  'complete',
  'pending',
  'cancelled',
]);

export type TransactionStatus = z.infer<typeof TransactionStatusSchema>;

export const TransactionSchema = z.object({
  id: z.string(),
  type: TransactionTypeSchema,
  from: z.object({
    name: z.string(),
    initials: z.string(),
    avatarColor: z.string(),
  }),
  amount: z.number().positive(),
  status: TransactionStatusSchema,
  date: z.string(),
});

export type Transaction = z.infer<typeof TransactionSchema>;

export const RevenueSourceSchema = z.object({
  name: z.string(),
  percentage: z.number().min(0).max(100),
  color: z.string(),
  trend: z.number(),
});

export type RevenueSource = z.infer<typeof RevenueSourceSchema>;

export const EvolutionDataPointSchema = z.object({
  date: z.string(),
  revenus_bruts: z.number(),
  ppv_achats: z.number(),
  tips: z.number(),
  marketplace: z.number(),
});

export type EvolutionDataPoint = z.infer<typeof EvolutionDataPointSchema>;

export interface BalanceData {
  available: number;
  pending: number;
}

export interface PayoutData {
  date: string;
  amount: number;
}

export interface UpcomingRelease {
  days: number;
  amount: number;
  status: 'released' | 'pending';
}
