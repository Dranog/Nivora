/**
 * Analytics Types - F3 Zod Schemas
 */

import { z } from 'zod';

// Time range
export const timeRangeSchema = z.enum(['day', 'week', 'month', 'year', 'all']);
export type TimeRange = z.infer<typeof timeRangeSchema>;

// Analytics metric
export const metricSchema = z.object({
  label: z.string(),
  value: z.number(),
  change: z.number().optional(), // percentage change from previous period
  trend: z.enum(['up', 'down', 'stable']).optional(),
});

export type Metric = z.infer<typeof metricSchema>;

// Time series data point
export const timeSeriesDataPointSchema = z.object({
  timestamp: z.string().datetime(),
  value: z.number(),
});

export type TimeSeriesDataPoint = z.infer<typeof timeSeriesDataPointSchema>;

// Overview analytics
export const analyticsOverviewSchema = z.object({
  views: metricSchema,
  likes: metricSchema,
  comments: metricSchema,
  followers: metricSchema,
  subscribers: metricSchema,
  revenue: metricSchema,
});

export type AnalyticsOverview = z.infer<typeof analyticsOverviewSchema>;

// Revenue analytics
export const revenueAnalyticsSchema = z.object({
  total: z.number(), // in cents
  subscriptions: z.number(),
  oneTime: z.number(),
  tips: z.number(),
  currency: z.string().default('USD'),
  timeSeries: z.array(timeSeriesDataPointSchema),
});

export type RevenueAnalytics = z.infer<typeof revenueAnalyticsSchema>;

// Audience analytics
export const audienceAnalyticsSchema = z.object({
  totalFollowers: z.number(),
  totalSubscribers: z.number(),
  activeSubscribers: z.number(),
  churnRate: z.number(), // percentage
  retention: z.number(), // percentage
  demographics: z.object({
    topCountries: z.array(z.object({ country: z.string(), count: z.number() })),
    ageGroups: z.array(z.object({ range: z.string(), count: z.number() })),
  }).optional(),
});

export type AudienceAnalytics = z.infer<typeof audienceAnalyticsSchema>;

// Content analytics
export const contentAnalyticsSchema = z.object({
  totalPosts: z.number(),
  totalViews: z.number(),
  totalLikes: z.number(),
  totalComments: z.number(),
  averageEngagement: z.number(), // percentage
  topPosts: z.array(z.object({
    id: z.string(),
    title: z.string(),
    views: z.number(),
    likes: z.number(),
    comments: z.number(),
  })),
});

export type ContentAnalytics = z.infer<typeof contentAnalyticsSchema>;

// Complete analytics response
export const analyticsResponseSchema = z.object({
  overview: analyticsOverviewSchema,
  revenue: revenueAnalyticsSchema.optional(),
  audience: audienceAnalyticsSchema.optional(),
  content: contentAnalyticsSchema.optional(),
  timeRange: timeRangeSchema,
  generatedAt: z.string().datetime(),
});

export type AnalyticsResponse = z.infer<typeof analyticsResponseSchema>;

// Analytics query params
export const analyticsQuerySchema = z.object({
  timeRange: timeRangeSchema.default('month'),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export type AnalyticsQuery = z.infer<typeof analyticsQuerySchema>;

// ============================================================================
// F10 - Advanced Analytics Types
// ============================================================================

// Advanced Filters
export const AnalyticsPeriodSchema = z.enum(['7d', '30d', '90d', 'custom']);
export type AnalyticsPeriod = z.infer<typeof AnalyticsPeriodSchema>;

export const AnalyticsSegmentSchema = z.enum(['all', 'paying', 'free']);
export type AnalyticsSegment = z.infer<typeof AnalyticsSegmentSchema>;

export const AnalyticsSourceSchema = z.enum(['all', 'market', 'direct']);
export type AnalyticsSource = z.infer<typeof AnalyticsSourceSchema>;

export const AnalyticsFiltersSchema = z.object({
  period: AnalyticsPeriodSchema.default('30d'),
  segment: AnalyticsSegmentSchema.default('all'),
  source: AnalyticsSourceSchema.default('all'),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export type AnalyticsFilters = z.infer<typeof AnalyticsFiltersSchema>;

// Advanced KPI
export const AnalyticsKpiSchema = z.object({
  label: z.string(),
  value: z.number(),
  change: z.number(), // percentage change from previous period
  trend: z.enum(['up', 'down', 'stable']),
  format: z.enum(['number', 'currency', 'percentage']).default('number'),
});

export type AnalyticsKpi = z.infer<typeof AnalyticsKpiSchema>;

// Advanced Overview
export const AdvancedAnalyticsOverviewSchema = z.object({
  totalRevenue: AnalyticsKpiSchema,
  subscribers: AnalyticsKpiSchema,
  arpu: AnalyticsKpiSchema, // Average Revenue Per User
  conversionRate: AnalyticsKpiSchema,
  churnRate: AnalyticsKpiSchema,
  newSubscribers: AnalyticsKpiSchema,
  mrr: AnalyticsKpiSchema, // Monthly Recurring Revenue
  ltv: AnalyticsKpiSchema, // Lifetime Value
});

export type AdvancedAnalyticsOverview = z.infer<typeof AdvancedAnalyticsOverviewSchema>;

// Revenue Metrics
export const RevenueDataPointSchema = z.object({
  date: z.string(),
  revenue: z.number(),
  subscriptions: z.number(),
  oneTime: z.number(),
  refunds: z.number().optional(),
});

export type RevenueDataPoint = z.infer<typeof RevenueDataPointSchema>;

export const RevenueMetricsSchema = z.object({
  timeSeries: z.array(RevenueDataPointSchema),
  total: z.number(),
  average: z.number(),
  peak: z.object({
    date: z.string(),
    amount: z.number(),
  }),
  breakdown: z.object({
    subscriptions: z.number(),
    oneTime: z.number(),
    refunds: z.number(),
  }),
});

export type RevenueMetrics = z.infer<typeof RevenueMetricsSchema>;

// Retention & Cohorts
export const CohortDataSchema = z.object({
  cohortDate: z.string(), // Month when users joined
  size: z.number(), // Initial cohort size
  retention: z.array(z.number()), // Retention % for each period [month0, month1, month2, ...]
});

export type CohortData = z.infer<typeof CohortDataSchema>;

export const RetentionDataSchema = z.object({
  cohorts: z.array(CohortDataSchema),
  averageRetention: z.object({
    month1: z.number(),
    month3: z.number(),
    month6: z.number(),
    month12: z.number(),
  }),
  churnRate: z.number(), // Overall churn rate
});

export type RetentionData = z.infer<typeof RetentionDataSchema>;

// Geographic Data
export const GeoDataPointSchema = z.object({
  country: z.string(),
  countryCode: z.string(), // ISO 3166-1 alpha-2
  users: z.number(),
  revenue: z.number(),
  percentage: z.number(), // % of total
});

export type GeoDataPoint = z.infer<typeof GeoDataPointSchema>;

export const GeoDataSchema = z.object({
  byCountry: z.array(GeoDataPointSchema),
  topCountries: z.array(GeoDataPointSchema), // Top 10
  totalCountries: z.number(),
});

export type GeoData = z.infer<typeof GeoDataSchema>;

// Device & Platform Data
export const DeviceDataPointSchema = z.object({
  device: z.string(), // 'mobile', 'desktop', 'tablet'
  platform: z.string(), // 'iOS', 'Android', 'Windows', 'macOS', 'Linux'
  browser: z.string().optional(), // 'Chrome', 'Safari', 'Firefox', etc.
  users: z.number(),
  sessions: z.number(),
  percentage: z.number(),
});

export type DeviceDataPoint = z.infer<typeof DeviceDataPointSchema>;

export const DeviceBreakdownSchema = z.object({
  byDevice: z.array(DeviceDataPointSchema),
  byPlatform: z.array(DeviceDataPointSchema),
  byBrowser: z.array(DeviceDataPointSchema),
  totalSessions: z.number(),
});

export type DeviceBreakdown = z.infer<typeof DeviceBreakdownSchema>;

// Engagement Metrics
export const EngagementMetricsSchema = z.object({
  avgSessionDuration: z.number(), // seconds
  avgPageViews: z.number(),
  bounceRate: z.number(), // percentage
  activeUsers: z.object({
    daily: z.number(),
    weekly: z.number(),
    monthly: z.number(),
  }),
  contentViews: z.object({
    total: z.number(),
    perUser: z.number(),
  }),
});

export type EngagementMetrics = z.infer<typeof EngagementMetricsSchema>;

// Helper Functions
export function calculateTrend(current: number, previous: number): 'up' | 'down' | 'stable' {
  const threshold = 0.01; // 1% threshold for "stable"
  const change = previous === 0 ? 0 : (current - previous) / previous;

  if (Math.abs(change) < threshold) return 'stable';
  return change > 0 ? 'up' : 'down';
}

export function calculateChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

export function formatKpi(
  label: string,
  value: number,
  previousValue: number,
  format: 'number' | 'currency' | 'percentage' = 'number'
): AnalyticsKpi {
  const change = calculateChange(value, previousValue);
  const trend = calculateTrend(value, previousValue);

  return {
    label,
    value,
    change,
    trend,
    format,
  };
}

// ============================================================================
// F10 - Analytics UI Component Types (Mock Data)
// ============================================================================

export interface AnalyticsKPI {
  label: string
  value: string
  trend: {
    isPositive: boolean
    value: string
  }
  description?: string
}

export interface PerformanceDataPoint {
  date: string
  revenue: number
  subscribers: number
  traffic: number
}

export interface TopPost {
  id: string
  title: string
  thumbnail: string
  revenue: string
  views: number
}

export interface ContentPerformance {
  id: string
  title: string
  type: string
  views: string
  purchases: string
  revenue: string
  engagement: number
}
