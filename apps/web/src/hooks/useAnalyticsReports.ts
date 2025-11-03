/**
 * Analytics Reports Hooks
 * Connects to /api/admin/analytics endpoints for platform analytics
 */

import {
  useQuery,
  useMutation,
  type UseQueryOptions,
} from '@tanstack/react-query';
import { adminToasts } from '@/lib/toasts';

// ============================================================================
// TYPES
// ============================================================================

export type PeriodType = '7d' | '30d' | '90d' | '1y' | 'custom';
export type ComparisonType = 'none' | 'previous' | 'mom' | 'yoy';

export interface DateRange {
  from: string; // ISO date string
  to: string;   // ISO date string
}

export interface AnalyticsQuery {
  period?: PeriodType;
  dateRange?: DateRange;
  comparison?: ComparisonType;
}

// Revenue Analytics Types
export interface RevenueData {
  total: number;
  previous: number;
  change: number;
  changePercent: number;
  timeSeries: Array<{
    date: string;
    amount: number;
    previousAmount?: number;
  }>;
  byCategory: Array<{
    category: string;
    amount: number;
    percentage: number;
    change: number;
  }>;
  byType: Array<{
    type: 'subscription' | 'ppv' | 'tip' | 'marketplace';
    amount: number;
    count: number;
  }>;
  topCreators: Array<{
    id: string;
    name: string;
    avatar: string;
    revenue: number;
    growth: number;
  }>;
}

// User Analytics Types
export interface UserData {
  total: number;
  active: number;
  new: number;
  churn: number;
  growth: number;
  timeSeries: Array<{
    date: string;
    total: number;
    active: number;
    new: number;
  }>;
  byRole: Array<{
    role: 'creator' | 'fan' | 'admin';
    count: number;
    percentage: number;
  }>;
  retention: Array<{
    cohort: string;
    period: number;
    rate: number;
  }>;
  geography: Array<{
    country: string;
    code: string;
    users: number;
    percentage: number;
  }>;
}

// Content Analytics Types
export interface ContentData {
  totalPosts: number;
  totalViews: number;
  totalEngagement: number;
  avgEngagementRate: number;
  timeSeries: Array<{
    date: string;
    posts: number;
    views: number;
    engagement: number;
  }>;
  byType: Array<{
    type: string;
    count: number;
    views: number;
    engagement: number;
  }>;
  topPosts: Array<{
    id: string;
    title: string;
    creator: string;
    views: number;
    engagement: number;
    revenue: number;
  }>;
  performance: {
    mostViewed: number;
    mostEngaged: number;
    avgViewsPerPost: number;
    avgEngagementPerPost: number;
  };
}

// Moderation Analytics Types
export interface ModerationData {
  totalReports: number;
  pending: number;
  resolved: number;
  avgResponseTime: number; // in hours
  timeSeries: Array<{
    date: string;
    reports: number;
    resolved: number;
    avgResponseTime: number;
  }>;
  byCategory: Array<{
    category: string;
    count: number;
    percentage: number;
  }>;
  byStatus: Array<{
    status: 'pending' | 'reviewing' | 'resolved' | 'dismissed';
    count: number;
  }>;
  moderatorStats: Array<{
    id: string;
    name: string;
    resolved: number;
    avgResponseTime: number;
  }>;
}

// PDF Export Types
export interface ExportPDFRequest {
  period: PeriodType;
  dateRange?: DateRange;
  sections: Array<'revenue' | 'users' | 'content' | 'moderation'>;
  includeCharts: boolean;
}

export interface ExportPDFResponse {
  url: string;
  filename: string;
  expiresAt: string;
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

async function fetchRevenueAnalytics(query: AnalyticsQuery): Promise<RevenueData> {
  const params = new URLSearchParams();
  if (query.period) params.set('period', query.period);
  if (query.comparison) params.set('comparison', query.comparison);
  if (query.dateRange) {
    params.set('from', query.dateRange.from);
    params.set('to', query.dateRange.to);
  }

  const res = await fetch(`/api/admin/analytics/revenue?${params.toString()}`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`Revenue analytics HTTP ${res.status}`);
  }

  return res.json();
}

async function fetchUserAnalytics(query: AnalyticsQuery): Promise<UserData> {
  const params = new URLSearchParams();
  if (query.period) params.set('period', query.period);
  if (query.comparison) params.set('comparison', query.comparison);
  if (query.dateRange) {
    params.set('from', query.dateRange.from);
    params.set('to', query.dateRange.to);
  }

  const res = await fetch(`/api/admin/analytics/users?${params.toString()}`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`User analytics HTTP ${res.status}`);
  }

  return res.json();
}

async function fetchContentAnalytics(query: AnalyticsQuery): Promise<ContentData> {
  const params = new URLSearchParams();
  if (query.period) params.set('period', query.period);
  if (query.comparison) params.set('comparison', query.comparison);
  if (query.dateRange) {
    params.set('from', query.dateRange.from);
    params.set('to', query.dateRange.to);
  }

  const res = await fetch(`/api/admin/analytics/content?${params.toString()}`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`Content analytics HTTP ${res.status}`);
  }

  return res.json();
}

async function fetchModerationAnalytics(query: AnalyticsQuery): Promise<ModerationData> {
  const params = new URLSearchParams();
  if (query.period) params.set('period', query.period);
  if (query.comparison) params.set('comparison', query.comparison);
  if (query.dateRange) {
    params.set('from', query.dateRange.from);
    params.set('to', query.dateRange.to);
  }

  const res = await fetch(`/api/admin/analytics/moderation?${params.toString()}`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`Moderation analytics HTTP ${res.status}`);
  }

  return res.json();
}

async function exportPDFReport(request: ExportPDFRequest): Promise<ExportPDFResponse> {
  const res = await fetch('/api/admin/analytics/export/pdf', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!res.ok) {
    throw new Error(`PDF export HTTP ${res.status}`);
  }

  return res.json();
}

// ============================================================================
// REACT QUERY HOOKS
// ============================================================================

export const analyticsKeys = {
  all: ['analytics'] as const,
  revenue: (query: AnalyticsQuery) => [...analyticsKeys.all, 'revenue', query] as const,
  users: (query: AnalyticsQuery) => [...analyticsKeys.all, 'users', query] as const,
  content: (query: AnalyticsQuery) => [...analyticsKeys.all, 'content', query] as const,
  moderation: (query: AnalyticsQuery) => [...analyticsKeys.all, 'moderation', query] as const,
};

/**
 * Fetch revenue analytics with optional period and comparison
 */
export function useRevenueAnalytics(
  query: AnalyticsQuery = { period: '30d' },
  options?: Omit<UseQueryOptions<RevenueData, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: analyticsKeys.revenue(query),
    queryFn: () => fetchRevenueAnalytics(query),
    staleTime: 60 * 1000, // 1 minute
    ...options,
  });
}

/**
 * Fetch user analytics with optional period and comparison
 */
export function useUserAnalytics(
  query: AnalyticsQuery = { period: '30d' },
  options?: Omit<UseQueryOptions<UserData, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: analyticsKeys.users(query),
    queryFn: () => fetchUserAnalytics(query),
    staleTime: 60 * 1000, // 1 minute
    ...options,
  });
}

/**
 * Fetch content analytics with optional period and comparison
 */
export function useContentAnalytics(
  query: AnalyticsQuery = { period: '30d' },
  options?: Omit<UseQueryOptions<ContentData, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: analyticsKeys.content(query),
    queryFn: () => fetchContentAnalytics(query),
    staleTime: 60 * 1000, // 1 minute
    ...options,
  });
}

/**
 * Fetch moderation analytics with optional period and comparison
 */
export function useModerationAnalytics(
  query: AnalyticsQuery = { period: '30d' },
  options?: Omit<UseQueryOptions<ModerationData, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: analyticsKeys.moderation(query),
    queryFn: () => fetchModerationAnalytics(query),
    staleTime: 60 * 1000, // 1 minute
    ...options,
  });
}

/**
 * Export analytics report as PDF
 */
export function useExportPDF() {
  return useMutation({
    mutationFn: exportPDFReport,
    onSuccess: (data) => {
      // Download the PDF
      const link = document.createElement('a');
      link.href = data.url;
      link.download = data.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      adminToasts.analytics.exportSuccess();
    },
    onError: (error) => {
      adminToasts.analytics.exportFailed(error.message);
    },
  });
}
