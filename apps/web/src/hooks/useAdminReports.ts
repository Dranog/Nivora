/**
 * Admin Reports Hooks
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
} from '@tanstack/react-query';
import {
  getReports,
  getReportStats,
  getReportDetail,
  updateReport,
  resolveReport,
  dismissReport,
  assignReport,
  bulkActionReports,
  reportsKeys,
} from '@/lib/api/reports';
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
import { adminToasts } from '@/lib/toasts';

export function useReports(
  query: ReportsQuery = {},
  options?: Omit<UseQueryOptions<ReportsListResponse, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: reportsKeys.list(query),
    queryFn: () => getReports(query),
    staleTime: 30 * 1000,
    ...options,
  });
}

export function useReportStats(
  options?: Omit<UseQueryOptions<ReportStats, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: reportsKeys.stats(),
    queryFn: getReportStats,
    staleTime: 60 * 1000,
    ...options,
  });
}

export function useReportDetail(
  reportId: string,
  options?: Omit<UseQueryOptions<ReportDetail, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: reportsKeys.detail(reportId),
    queryFn: () => getReportDetail(reportId),
    enabled: !!reportId,
    staleTime: 30 * 1000,
    ...options,
  });
}

export function useUpdateReport(
  options?: Omit<
    UseMutationOptions<{ message: string }, Error, { reportId: string; data: UpdateReportData }>,
    'mutationFn'
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reportId, data }) => updateReport(reportId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: reportsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: reportsKeys.detail(variables.reportId) });
      adminToasts.reports.updated();
    },
    onError: (error) => {
      adminToasts.reports.updateFailed(error.message);
    },
    ...options,
  });
}

export function useResolveReport(
  options?: Omit<
    UseMutationOptions<{ message: string }, Error, { reportId: string; data: ResolveReportData }>,
    'mutationFn'
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reportId, data }) => resolveReport(reportId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: reportsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: reportsKeys.stats() });
      queryClient.invalidateQueries({ queryKey: reportsKeys.detail(variables.reportId) });
      adminToasts.reports.resolved();
    },
    onError: (error) => {
      adminToasts.reports.resolveFailed(error.message);
    },
    ...options,
  });
}

export function useDismissReport(
  options?: Omit<
    UseMutationOptions<{ message: string }, Error, { reportId: string; data: DismissReportData }>,
    'mutationFn'
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reportId, data }) => dismissReport(reportId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: reportsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: reportsKeys.stats() });
      queryClient.invalidateQueries({ queryKey: reportsKeys.detail(variables.reportId) });
      adminToasts.reports.dismissed();
    },
    onError: (error) => {
      adminToasts.reports.resolveFailed(error.message);
    },
    ...options,
  });
}

export function useAssignReport(
  options?: Omit<
    UseMutationOptions<{ message: string }, Error, { reportId: string; data: AssignReportData }>,
    'mutationFn'
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reportId, data }) => assignReport(reportId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: reportsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: reportsKeys.detail(variables.reportId) });
      adminToasts.reports.assigned();
    },
    onError: (error) => {
      adminToasts.reports.updateFailed(error.message);
    },
    ...options,
  });
}

export function useBulkActionReports(
  options?: Omit<
    UseMutationOptions<BulkReportActionResponse, Error, BulkReportActionRequest>,
    'mutationFn'
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bulkActionReports,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: reportsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: reportsKeys.stats() });

      const { success, failed } = data;
      if (failed === 0) {
        adminToasts.reports.bulkResolved(success);
      } else {
        adminToasts.reports.bulkActionPartial(success, failed);
      }
    },
    onError: (error) => {
      adminToasts.reports.resolveFailed(error.message);
    },
    ...options,
  });
}
