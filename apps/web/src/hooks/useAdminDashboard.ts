/**
 * Admin Dashboard Hooks
 * React Query hooks for dashboard data fetching
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import {
  getDashboardMetrics,
  getDashboardStats,
  getTopCreators,
  getEngagementMetrics,
  getActivityMetrics,
  getGeographyData,
  getConversionFunnel,
  getUpcomingPayouts,
  dashboardKeys,
} from '@/lib/api/dashboard';
import type {
  DashboardResponse,
  DashboardMetrics,
  TopCreator,
  EngagementMetrics,
  ActivityMetrics,
  GeographyData,
  ConversionFunnel,
  UpcomingPayout,
} from '@/lib/api/types';

/**
 * Hook: Get comprehensive dashboard metrics
 * Includes KPIs, charts, and top creators
 */
export function useDashboardMetrics(
  period: 'day' | 'week' | 'month' = 'day',
  refresh: boolean = false,
  options?: Omit<UseQueryOptions<DashboardResponse, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: dashboardKeys.metrics(period, refresh),
    queryFn: () => getDashboardMetrics(period, refresh),
    staleTime: 30 * 1000, // 30 seconds
    ...options,
  });
}

/**
 * Hook: Get simple dashboard statistics (KPIs only)
 */
export function useDashboardStats(
  options?: Omit<UseQueryOptions<DashboardMetrics, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: dashboardKeys.stats(),
    queryFn: getDashboardStats,
    staleTime: 30 * 1000, // 30 seconds
    ...options,
  });
}

/**
 * Hook: Get top creators by revenue
 */
export function useTopCreators(
  limit: number = 5,
  options?: Omit<UseQueryOptions<TopCreator[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: dashboardKeys.topCreators(limit),
    queryFn: () => getTopCreators(limit),
    staleTime: 60 * 1000, // 1 minute
    ...options,
  });
}

/**
 * Hook: Get engagement metrics
 */
export function useEngagementMetrics(
  options?: Omit<UseQueryOptions<EngagementMetrics, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: dashboardKeys.engagement(),
    queryFn: getEngagementMetrics,
    staleTime: 60 * 1000, // 1 minute
    ...options,
  });
}

/**
 * Hook: Get activity metrics
 */
export function useActivityMetrics(
  options?: Omit<UseQueryOptions<ActivityMetrics, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: dashboardKeys.activity(),
    queryFn: getActivityMetrics,
    staleTime: 30 * 1000, // 30 seconds (more realtime)
    ...options,
  });
}

/**
 * Hook: Get geography data
 */
export function useGeographyData(
  limit: number = 5,
  options?: Omit<UseQueryOptions<GeographyData[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: dashboardKeys.geography(limit),
    queryFn: () => getGeographyData(limit),
    staleTime: 120 * 1000, // 2 minutes
    ...options,
  });
}

/**
 * Hook: Get conversion funnel
 */
export function useConversionFunnel(
  options?: Omit<UseQueryOptions<ConversionFunnel, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: dashboardKeys.funnel(),
    queryFn: getConversionFunnel,
    staleTime: 120 * 1000, // 2 minutes
    ...options,
  });
}

/**
 * Hook: Get upcoming payouts
 */
export function useUpcomingPayouts(
  options?: Omit<UseQueryOptions<UpcomingPayout[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: dashboardKeys.upcomingPayouts(),
    queryFn: getUpcomingPayouts,
    staleTime: 60 * 1000, // 1 minute
    ...options,
  });
}
