import { z } from 'zod';
import type { LucideIcon } from 'lucide-react';

export const IconColorSchema = z.enum(['blue', 'cyan', 'green', 'purple']);
export type IconColor = z.infer<typeof IconColorSchema>;

export const KPIDataSchema = z.object({
  icon: z.string(),
  iconColor: IconColorSchema,
  label: z.string(),
  value: z.string(),
  trend: z.string(),
});
export type KPIData = z.infer<typeof KPIDataSchema>;

export const CreatorSchema = z.object({
  id: z.string(),
  name: z.string(),
  username: z.string(),
  avatar: z.string(),
  amount: z.number(),
  trend: z.number(),
  sparklineData: z.array(z.number()),
  isHot: z.boolean().optional(),
});
export type Creator = z.infer<typeof CreatorSchema>;

export const RevenueDataPointSchema = z.object({
  date: z.string(),
  revenus: z.number(),
  ppv: z.number(),
  tips: z.number(),
  marketplace: z.number(),
});
export type RevenueDataPoint = z.infer<typeof RevenueDataPointSchema>;

export const ActivityTypeSchema = z.enum(['verified', 'transaction', 'report', 'subscription', 'withdrawal']);
export type ActivityType = z.infer<typeof ActivityTypeSchema>;

export interface Activity {
  id: string;
  type: ActivityType;
  icon: LucideIcon;
  iconColor: string;
  text: string;
  timestamp: string;
}

export const RevenueSourceSchema = z.object({
  name: z.string(),
  value: z.number(),
  percentage: z.number(),
  color: z.string(),
});
export type RevenueSource = z.infer<typeof RevenueSourceSchema>;

export const CountrySchema = z.object({
  name: z.string(),
  flag: z.string(),
  amount: z.number(),
  percentage: z.number(),
});
export type Country = z.infer<typeof CountrySchema>;

export const FunnelStepSchema = z.object({
  label: z.string(),
  value: z.number(),
  percentage: z.number(),
});
export type FunnelStep = z.infer<typeof FunnelStepSchema>;

export const UpcomingPaymentSchema = z.object({
  days: z.number(),
  amount: z.number(),
  status: z.enum(['released', 'pending']),
});
export type UpcomingPayment = z.infer<typeof UpcomingPaymentSchema>;

export const BalanceDataSchema = z.object({
  available: z.number(),
  pending: z.number(),
  nextPayoutDays: z.number(),
});
export type BalanceData = z.infer<typeof BalanceDataSchema>;

export const Evolution7dDataSchema = z.object({
  current: z.number(),
  growth: z.number(),
  sparklineData: z.array(z.number()),
});
export type Evolution7dData = z.infer<typeof Evolution7dDataSchema>;

export const LiveStatsIconColorSchema = z.enum(['pink', 'purple', 'blue', 'cyan']);
export type LiveStatsIconColor = z.infer<typeof LiveStatsIconColorSchema>;

export const BadgeVariantSchema = z.enum(['green', 'red']);
export type BadgeVariant = z.infer<typeof BadgeVariantSchema>;

export interface LiveStatsMetric {
  icon: LucideIcon;
  iconColor: LiveStatsIconColor;
  value: string;
  label: string;
  badge: string;
  badgeVariant: BadgeVariant;
}

export const EngagementIconColorSchema = z.enum(['green', 'blue', 'purple', 'orange', 'pink']);
export type EngagementIconColor = z.infer<typeof EngagementIconColorSchema>;

export interface EngagementMetric {
  icon: LucideIcon;
  iconColor: EngagementIconColor;
  value: string;
  label: string;
  progressBar?: number;
  badge?: string;
  badgeVariant?: BadgeVariant;
}
