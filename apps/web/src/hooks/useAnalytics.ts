/**
 * Analytics Hooks - F3 React Query
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import * as analyticsApi from '@/lib/api/analytics';
import { analyticsKeys } from '@/lib/api/analytics';
import type { AnalyticsResponse, AnalyticsQuery, RevenueAnalytics, AudienceAnalytics, ContentAnalytics } from '@/types/analytics';

/**
 * Get analytics overview
 */
export function useAnalytics(
  query?: AnalyticsQuery,
  options?: Omit<UseQueryOptions<AnalyticsResponse, Error>, 'queryKey' | 'queryFn'>
) {
  const queryWithDefaults = { timeRange: 'month' as const, ...query };
  return useQuery({
    queryKey: analyticsKeys.overview(queryWithDefaults),
    queryFn: () => analyticsApi.getAnalytics(query),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

/**
 * Get revenue analytics
 */
export function useRevenueAnalytics(
  query?: AnalyticsQuery,
  options?: Omit<UseQueryOptions<RevenueAnalytics, Error>, 'queryKey' | 'queryFn'>
) {
  const queryWithDefaults = { timeRange: 'month' as const, ...query };
  return useQuery({
    queryKey: analyticsKeys.revenue(queryWithDefaults),
    queryFn: () => analyticsApi.getRevenueAnalytics(query),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

/**
 * Get audience analytics
 */
export function useAudienceAnalytics(
  query?: AnalyticsQuery,
  options?: Omit<UseQueryOptions<AudienceAnalytics, Error>, 'queryKey' | 'queryFn'>
) {
  const queryWithDefaults = { timeRange: 'month' as const, ...query };
  return useQuery({
    queryKey: analyticsKeys.audience(queryWithDefaults),
    queryFn: () => analyticsApi.getAudienceAnalytics(query),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

/**
 * Get content analytics
 */
export function useContentAnalytics(
  query?: AnalyticsQuery,
  options?: Omit<UseQueryOptions<ContentAnalytics, Error>, 'queryKey' | 'queryFn'>
) {
  const queryWithDefaults = { timeRange: 'month' as const, ...query };
  return useQuery({
    queryKey: analyticsKeys.content(queryWithDefaults),
    queryFn: () => analyticsApi.getContentAnalytics(query),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

// ============================================================================
// F10 - Advanced Analytics Hooks
// ============================================================================

import { useSuspenseQuery } from '@tanstack/react-query';
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
  fetchAnalyticsOverview,
  fetchRevenueMetrics,
  fetchRetentionCohorts,
  fetchGeoData,
  fetchDeviceBreakdown,
  fetchEngagementMetrics,
  advancedAnalyticsKeys,
} from '@/lib/api/analytics';

export const defaultFilters: AnalyticsFilters = {
  period: '30d',
  segment: 'all',
  source: 'all',
};

// Overview Hook
export function useAnalyticsOverview(
  filters: AnalyticsFilters = defaultFilters,
  options?: Omit<UseQueryOptions<AdvancedAnalyticsOverview, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: advancedAnalyticsKeys.overview(filters),
    queryFn: () => fetchAnalyticsOverview(filters),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

export function useAnalyticsOverviewSuspense(filters: AnalyticsFilters = defaultFilters) {
  return useSuspenseQuery({
    queryKey: advancedAnalyticsKeys.overview(filters),
    queryFn: () => fetchAnalyticsOverview(filters),
    staleTime: 5 * 60 * 1000,
  });
}

// Revenue Metrics Hook
export function useRevenueMetrics(
  filters: AnalyticsFilters = defaultFilters,
  options?: Omit<UseQueryOptions<RevenueMetrics, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: advancedAnalyticsKeys.revenue(filters),
    queryFn: () => fetchRevenueMetrics(filters),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

export function useRevenueMetricsSuspense(filters: AnalyticsFilters = defaultFilters) {
  return useSuspenseQuery({
    queryKey: advancedAnalyticsKeys.revenue(filters),
    queryFn: () => fetchRevenueMetrics(filters),
    staleTime: 5 * 60 * 1000,
  });
}

// Retention Cohorts Hook
export function useRetentionCohorts(
  filters: AnalyticsFilters = defaultFilters,
  options?: Omit<UseQueryOptions<RetentionData, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: advancedAnalyticsKeys.retention(filters),
    queryFn: () => fetchRetentionCohorts(filters),
    staleTime: 10 * 60 * 1000,
    ...options,
  });
}

export function useRetentionCohortsSuspense(filters: AnalyticsFilters = defaultFilters) {
  return useSuspenseQuery({
    queryKey: advancedAnalyticsKeys.retention(filters),
    queryFn: () => fetchRetentionCohorts(filters),
    staleTime: 10 * 60 * 1000,
  });
}

// Geographic Data Hook
export function useGeoData(
  filters: AnalyticsFilters = defaultFilters,
  options?: Omit<UseQueryOptions<GeoData, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: advancedAnalyticsKeys.geo(filters),
    queryFn: () => fetchGeoData(filters),
    staleTime: 10 * 60 * 1000,
    ...options,
  });
}

export function useGeoDataSuspense(filters: AnalyticsFilters = defaultFilters) {
  return useSuspenseQuery({
    queryKey: advancedAnalyticsKeys.geo(filters),
    queryFn: () => fetchGeoData(filters),
    staleTime: 10 * 60 * 1000,
  });
}

// Device Breakdown Hook
export function useDeviceBreakdown(
  filters: AnalyticsFilters = defaultFilters,
  options?: Omit<UseQueryOptions<DeviceBreakdown, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: advancedAnalyticsKeys.devices(filters),
    queryFn: () => fetchDeviceBreakdown(filters),
    staleTime: 10 * 60 * 1000,
    ...options,
  });
}

export function useDeviceBreakdownSuspense(filters: AnalyticsFilters = defaultFilters) {
  return useSuspenseQuery({
    queryKey: advancedAnalyticsKeys.devices(filters),
    queryFn: () => fetchDeviceBreakdown(filters),
    staleTime: 10 * 60 * 1000,
  });
}

// Engagement Metrics Hook
export function useEngagementMetrics(
  filters: AnalyticsFilters = defaultFilters,
  options?: Omit<UseQueryOptions<EngagementMetrics, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: advancedAnalyticsKeys.engagement(filters),
    queryFn: () => fetchEngagementMetrics(filters),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

export function useEngagementMetricsSuspense(filters: AnalyticsFilters = defaultFilters) {
  return useSuspenseQuery({
    queryKey: advancedAnalyticsKeys.engagement(filters),
    queryFn: () => fetchEngagementMetrics(filters),
    staleTime: 5 * 60 * 1000,
  });
}

// Combined Hook for Overview Page (Parallel Queries)
export function useAnalyticsDashboard(filters: AnalyticsFilters = defaultFilters) {
  const overview = useAnalyticsOverview(filters);
  const revenue = useRevenueMetrics(filters);
  const retention = useRetentionCohorts(filters);

  return {
    overview,
    revenue,
    retention,
    isLoading: overview.isLoading || revenue.isLoading || retention.isLoading,
    isError: overview.isError || revenue.isError || retention.isError,
    error: overview.error || revenue.error || retention.error,
  };
}

// Combined Hook for Engagement Page
export function useEngagementDashboard(filters: AnalyticsFilters = defaultFilters) {
  const engagement = useEngagementMetrics(filters);
  const geo = useGeoData(filters);
  const devices = useDeviceBreakdown(filters);
  const retention = useRetentionCohorts(filters);

  return {
    engagement,
    geo,
    devices,
    retention,
    isLoading: engagement.isLoading || geo.isLoading || devices.isLoading || retention.isLoading,
    isError: engagement.isError || geo.isError || devices.isError || retention.isError,
    error: engagement.error || geo.error || devices.error || retention.error,
  };
}
