/**
 * Admin Reports API
 */

import { http } from '@/lib/http';
import type {
  ReportsQuery,
  ReportsListResponse,
  ReportDetail,
  ReportStats,
  UpdateReportData,
  ResolveReportData,
  DismissReportData,
  AssignReportData,
  BulkReportActionRequest,
  BulkReportActionResponse,
} from '@/types/reports';

// ============================================================================
// Query Keys
// ============================================================================

export const reportsKeys = {
  all: ['admin', 'reports'] as const,
  lists: () => [...reportsKeys.all, 'list'] as const,
  list: (query: ReportsQuery) => [...reportsKeys.lists(), query] as const,
  stats: () => [...reportsKeys.all, 'stats'] as const,
  details: () => [...reportsKeys.all, 'detail'] as const,
  detail: (id: string) => [...reportsKeys.details(), id] as const,
};

// ============================================================================
// API Functions
// ============================================================================

/**
 * GET /admin/reports
 */
export async function getReports(query: ReportsQuery = {}): Promise<ReportsListResponse> {
  const response = await http.get<ReportsListResponse>('/admin/reports', { params: query });
  return response;
}

/**
 * GET /admin/reports/stats
 */
export async function getReportStats(): Promise<ReportStats> {
  const response = await http.get<ReportStats>('/admin/reports/stats');
  return response;
}

/**
 * GET /admin/reports/:id
 */
export async function getReportDetail(reportId: string): Promise<ReportDetail> {
  const response = await http.get<ReportDetail>(`/admin/reports/${reportId}`);
  return response;
}

/**
 * PUT /admin/reports/:id
 */
export async function updateReport(
  reportId: string,
  data: UpdateReportData
): Promise<{ message: string }> {
  const response = await http.put<{ message: string }>(`/admin/reports/${reportId}`, data);
  return response;
}

/**
 * POST /admin/reports/:id/resolve
 */
export async function resolveReport(
  reportId: string,
  data: ResolveReportData
): Promise<{ message: string }> {
  const response = await http.post<{ message: string }>(`/admin/reports/${reportId}/resolve`, data);
  return response;
}

/**
 * POST /admin/reports/:id/dismiss
 */
export async function dismissReport(
  reportId: string,
  data: DismissReportData
): Promise<{ message: string }> {
  const response = await http.post<{ message: string }>(`/admin/reports/${reportId}/dismiss`, data);
  return response;
}

/**
 * POST /admin/reports/:id/assign
 */
export async function assignReport(
  reportId: string,
  data: AssignReportData
): Promise<{ message: string }> {
  const response = await http.post<{ message: string }>(`/admin/reports/${reportId}/assign`, data);
  return response;
}

/**
 * POST /admin/reports/bulk
 */
export async function bulkActionReports(
  data: BulkReportActionRequest
): Promise<BulkReportActionResponse> {
  const response = await http.post<BulkReportActionResponse>('/admin/reports/bulk', data);
  return response;
}
