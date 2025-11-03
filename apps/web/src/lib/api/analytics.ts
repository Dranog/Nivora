/**
 * Analytics API - F3 Stats + Query Keys
 */

import { http } from '@/lib/http';
import {
  type AnalyticsResponse,
  type AnalyticsQuery,
  type RevenueAnalytics,
  type AudienceAnalytics,
  type ContentAnalytics,
  analyticsResponseSchema,
  revenueAnalyticsSchema,
  audienceAnalyticsSchema,
  contentAnalyticsSchema,
} from '@/types/analytics';

// Query keys
export const analyticsKeys = {
  all: ['analytics'] as const,
  overview: (query: AnalyticsQuery) => [...analyticsKeys.all, 'overview', query] as const,
  revenue: (query: AnalyticsQuery) => [...analyticsKeys.all, 'revenue', query] as const,
  audience: (query: AnalyticsQuery) => [...analyticsKeys.all, 'audience', query] as const,
  content: (query: AnalyticsQuery) => [...analyticsKeys.all, 'content', query] as const,
};

// Get analytics overview
export async function getAnalytics(query?: AnalyticsQuery): Promise<AnalyticsResponse> {
  const response = await http.get<AnalyticsResponse>('/analytics', { params: query });
  return analyticsResponseSchema.parse(response);
}

// Get revenue analytics
export async function getRevenueAnalytics(query?: AnalyticsQuery): Promise<RevenueAnalytics> {
  const response = await http.get<RevenueAnalytics>('/analytics/revenue', { params: query });
  return revenueAnalyticsSchema.parse(response);
}

// Get audience analytics
export async function getAudienceAnalytics(query?: AnalyticsQuery): Promise<AudienceAnalytics> {
  const response = await http.get<AudienceAnalytics>('/analytics/audience', { params: query });
  return audienceAnalyticsSchema.parse(response);
}

// Get content analytics
export async function getContentAnalytics(query?: AnalyticsQuery): Promise<ContentAnalytics> {
  const response = await http.get<ContentAnalytics>('/analytics/content', { params: query });
  return contentAnalyticsSchema.parse(response);
}

// ============================================================================
// F10 - Advanced Analytics API
// ============================================================================

import type {
  AnalyticsFilters,
  AdvancedAnalyticsOverview,
  RevenueMetrics,
  RetentionData,
  GeoData,
  DeviceBreakdown,
  EngagementMetrics,
} from '@/types/analytics';
import {
  AdvancedAnalyticsOverviewSchema,
  RevenueMetricsSchema,
  RetentionDataSchema,
  GeoDataSchema,
  DeviceBreakdownSchema,
  EngagementMetricsSchema,
  AnalyticsFiltersSchema,
} from '@/types/analytics';

// Extended query keys for F10
export const advancedAnalyticsKeys = {
  all: ['advanced-analytics'] as const,
  overview: (filters: AnalyticsFilters) => [...advancedAnalyticsKeys.all, 'overview', filters] as const,
  revenue: (filters: AnalyticsFilters) => [...advancedAnalyticsKeys.all, 'revenue', filters] as const,
  retention: (filters: AnalyticsFilters) => [...advancedAnalyticsKeys.all, 'retention', filters] as const,
  geo: (filters: AnalyticsFilters) => [...advancedAnalyticsKeys.all, 'geo', filters] as const,
  devices: (filters: AnalyticsFilters) => [...advancedAnalyticsKeys.all, 'devices', filters] as const,
  engagement: (filters: AnalyticsFilters) => [...advancedAnalyticsKeys.all, 'engagement', filters] as const,
};

/**
 * Fetch advanced analytics overview with KPIs
 */
export async function fetchAnalyticsOverview(
  filters: AnalyticsFilters
): Promise<AdvancedAnalyticsOverview> {
  // Validate filters
  const validatedFilters = AnalyticsFiltersSchema.parse(filters);

  const response = await http.get<AdvancedAnalyticsOverview>(
    '/analytics/v2/overview',
    { params: validatedFilters }
  );

  return AdvancedAnalyticsOverviewSchema.parse(response);
}

/**
 * Fetch detailed revenue metrics with time series
 */
export async function fetchRevenueMetrics(
  filters: AnalyticsFilters
): Promise<RevenueMetrics> {
  const validatedFilters = AnalyticsFiltersSchema.parse(filters);

  const response = await http.get<RevenueMetrics>(
    '/analytics/v2/revenue',
    { params: validatedFilters }
  );

  return RevenueMetricsSchema.parse(response);
}

/**
 * Fetch retention cohort data
 */
export async function fetchRetentionCohorts(
  filters: AnalyticsFilters
): Promise<RetentionData> {
  const validatedFilters = AnalyticsFiltersSchema.parse(filters);

  const response = await http.get<RetentionData>(
    '/analytics/v2/retention',
    { params: validatedFilters }
  );

  return RetentionDataSchema.parse(response);
}

/**
 * Fetch geographic distribution data
 */
export async function fetchGeoData(
  filters: AnalyticsFilters
): Promise<GeoData> {
  const validatedFilters = AnalyticsFiltersSchema.parse(filters);

  const response = await http.get<GeoData>(
    '/analytics/v2/geo',
    { params: validatedFilters }
  );

  return GeoDataSchema.parse(response);
}

/**
 * Fetch device and platform breakdown
 */
export async function fetchDeviceBreakdown(
  filters: AnalyticsFilters
): Promise<DeviceBreakdown> {
  const validatedFilters = AnalyticsFiltersSchema.parse(filters);

  const response = await http.get<DeviceBreakdown>(
    '/analytics/v2/devices',
    { params: validatedFilters }
  );

  return DeviceBreakdownSchema.parse(response);
}

/**
 * Fetch engagement metrics
 */
export async function fetchEngagementMetrics(
  filters: AnalyticsFilters
): Promise<EngagementMetrics> {
  const validatedFilters = AnalyticsFiltersSchema.parse(filters);

  const response = await http.get<EngagementMetrics>(
    '/analytics/v2/engagement',
    { params: validatedFilters }
  );

  return EngagementMetricsSchema.parse(response);
}
