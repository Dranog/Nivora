import { z } from 'zod';

export const ActivityTypeSchema = z.enum([
  'creator_verified',
  'transaction',
  'report_resolved',
  'subscription',
  'payout_approved',
]);

export type ActivityType = z.infer<typeof ActivityTypeSchema>;

export const RevenueSourceTypeSchema = z.enum([
  'subscriptions',
  'messages',
  'tips',
  'ppv',
  'lives',
]);

export type RevenueSourceType = z.infer<typeof RevenueSourceTypeSchema>;

export const KPISchema = z.object({
  label: z.string(),
  value: z.string(),
  trend: z.string(),
  icon: z.string(),
  color: z.enum(['blue', 'cyan', 'green', 'purple']),
});

export type KPI = z.infer<typeof KPISchema>;

export const BalanceDataSchema = z.object({
  available: z.number(),
  pending: z.number(),
  nextPayoutDays: z.number(),
});

export type BalanceData = z.infer<typeof BalanceDataSchema>;

export const UpcomingPaymentSchema = z.object({
  days: z.number(),
  amount: z.number(),
  status: z.enum(['released', 'pending']),
});

export type UpcomingPayment = z.infer<typeof UpcomingPaymentSchema>;

export const RevenueDataPointSchema = z.object({
  date: z.string(),
  revenus_bruts: z.number(),
  ppv_achats: z.number(),
  tips: z.number(),
  marketplace: z.number(),
});

export type RevenueDataPoint = z.infer<typeof RevenueDataPointSchema>;

export const CreatorSchema = z.object({
  id: z.string(),
  name: z.string(),
  username: z.string(),
  avatar: z.string(),
  revenue: z.number(),
  trend: z.array(z.number()),
  growth: z.number(),
  isHot: z.boolean(),
});

export type Creator = z.infer<typeof CreatorSchema>;

export const ActivitySchema = z.object({
  id: z.string(),
  type: ActivityTypeSchema,
  user: z.string(),
  time: z.string(),
  amount: z.number().optional(),
});

export type Activity = z.infer<typeof ActivitySchema>;

export const RevenueSourceSchema = z.object({
  name: z.string(),
  type: RevenueSourceTypeSchema,
  value: z.number(),
  amount: z.number(),
  color: z.string(),
});

export type RevenueSource = z.infer<typeof RevenueSourceSchema>;

export const CountryDataSchema = z.object({
  code: z.string(),
  name: z.string(),
  flag: z.string(),
  amount: z.number(),
  percentage: z.number(),
});

export type CountryData = z.infer<typeof CountryDataSchema>;

export const FunnelStepSchema = z.object({
  label: z.string(),
  count: z.number(),
  percentage: z.number(),
});

export type FunnelStep = z.infer<typeof FunnelStepSchema>;
