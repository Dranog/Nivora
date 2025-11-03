/**
 * Admin Dashboard API
 */

import { http } from '@/lib/http';
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

// ============================================================================
// Query Keys
// ============================================================================

export const dashboardKeys = {
  all: ['admin', 'dashboard'] as const,
  metrics: (period?: string, refresh?: boolean) => [
    ...dashboardKeys.all,
    'metrics',
    period,
    refresh,
  ] as const,
  stats: () => [...dashboardKeys.all, 'stats'] as const,
  topCreators: (limit?: number) => [...dashboardKeys.all, 'top-creators', limit] as const,
  engagement: () => [...dashboardKeys.all, 'engagement'] as const,
  activity: () => [...dashboardKeys.all, 'activity'] as const,
  geography: (limit?: number) => [...dashboardKeys.all, 'geography', limit] as const,
  funnel: () => [...dashboardKeys.all, 'funnel'] as const,
  upcomingPayouts: () => [...dashboardKeys.all, 'upcoming-payouts'] as const,
};

// ============================================================================
// API Functions
// ============================================================================

/**
 * GET /admin/dashboard/metrics
 * Get comprehensive dashboard data (metrics, charts, top creators)
 */
export async function getDashboardMetrics(
  period: 'day' | 'week' | 'month' = 'day',
  refresh: boolean = false
): Promise<DashboardResponse> {
  const response = await http.get<DashboardResponse>('/admin/dashboard/metrics', {
    params: { period, refresh },
  });
  return response;
}

/**
 * GET /admin/dashboard/stats
 * Get simple dashboard KPI statistics
 */
export async function getDashboardStats(): Promise<DashboardMetrics> {
  const response = await http.get<DashboardMetrics>('/admin/dashboard/stats');
  return response;
}

/**
 * GET /admin/dashboard/top-creators
 * Get top creators by revenue
 */
export async function getTopCreators(limit: number = 5): Promise<TopCreator[]> {
  const response = await http.get<TopCreator[]>('/admin/dashboard/top-creators', {
    params: { limit },
  });
  return response;
}

/**
 * GET /admin/dashboard/engagement
 * Get engagement metrics (likes, comments, shares)
 */
export async function getEngagementMetrics(): Promise<EngagementMetrics> {
  const response = await http.get<EngagementMetrics>('/admin/dashboard/engagement');
  return response;
}

/**
 * GET /admin/dashboard/activity
 * Get activity metrics (active users, session time, bounce rate)
 */
export async function getActivityMetrics(): Promise<ActivityMetrics> {
  const response = await http.get<ActivityMetrics>('/admin/dashboard/activity');
  return response;
}

/**
 * GET /admin/dashboard/geography
 * Get revenue by geography
 */
export async function getGeographyData(limit: number = 5): Promise<GeographyData[]> {
  const response = await http.get<GeographyData[]>('/admin/dashboard/geography', {
    params: { limit },
  });
  return response;
}

/**
 * GET /admin/dashboard/funnel
 * Get conversion funnel data
 */
export async function getConversionFunnel(): Promise<ConversionFunnel> {
  const response = await http.get<ConversionFunnel>('/admin/dashboard/funnel');
  return response;
}

/**
 * GET /admin/dashboard/upcoming-payouts
 * Get upcoming payout schedule
 */
export async function getUpcomingPayouts(): Promise<UpcomingPayout[]> {
  const response = await http.get<UpcomingPayout[]>('/admin/dashboard/upcoming-payouts');
  return response;
}
