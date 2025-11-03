/**
 * Admin API - F3 Admin Operations + F12 Console + Query Keys
 */

import { http } from '@/lib/http';
import { type UserList, userListSchema } from '@/types/user';
import { type PostList, postListSchema } from '@/types/post';
import type {
  AdminUserFilters,
  AdminUsersResponse,
  AdminPostFilters,
  AdminPostsResponse,
  AdminReportFilters,
  AdminReportsResponse,
  BanUserParams,
  UnbanUserParams,
  TakedownPostParams,
  RestorePostParams,
  ResolveReportParams,
  AssignReportParams,
  BulkActionParams,
} from '@/types/admin';
import {
  adminUsersResponseSchema,
  adminPostsResponseSchema,
  adminReportsResponseSchema,
} from '@/types/admin';

// Query keys
export const adminKeys = {
  all: ['admin'] as const,
  users: () => [...adminKeys.all, 'users'] as const,
  usersList: (filters: Record<string, unknown>) => [...adminKeys.users(), filters] as const,
  adminUsers: (filters: AdminUserFilters) => [...adminKeys.users(), 'admin', filters] as const,
  posts: () => [...adminKeys.all, 'posts'] as const,
  postsList: (filters: Record<string, unknown>) => [...adminKeys.posts(), filters] as const,
  adminPosts: (filters: AdminPostFilters) => [...adminKeys.posts(), 'admin', filters] as const,
  reports: () => [...adminKeys.all, 'reports'] as const,
  adminReports: (filters: AdminReportFilters) => [...adminKeys.reports(), filters] as const,
  stats: () => [...adminKeys.all, 'stats'] as const,
};

// Admin stats
export const adminStatsSchema = z.object({
  totalUsers: z.number(),
  totalCreators: z.number(),
  totalFans: z.number(),
  totalPosts: z.number(),
  totalRevenue: z.number(),
  activeSubscriptions: z.number(),
});

import { z } from 'zod';

export type AdminStats = z.infer<typeof adminStatsSchema>;

// Get admin stats
export async function getAdminStats(): Promise<AdminStats> {
  const response = await http.get<AdminStats>('/admin/stats');
  return adminStatsSchema.parse(response);
}

// Get all users (admin)
export async function getUsers(params?: {
  page?: number;
  pageSize?: number;
  role?: string;
  search?: string;
}): Promise<UserList> {
  const response = await http.get<UserList>('/admin/users', { params });
  return userListSchema.parse(response);
}

// Get all posts (admin)
export async function getPosts(params?: {
  page?: number;
  pageSize?: number;
  status?: string;
  search?: string;
}): Promise<PostList> {
  const response = await http.get<PostList>('/admin/posts', { params });
  return postListSchema.parse(response);
}

// Ban user
export async function banUser(userId: string, reason?: string): Promise<void> {
  await http.post<void>(`/admin/users/${userId}/ban`, { reason });
}

// Unban user
export async function unbanUser(userId: string): Promise<void> {
  await http.post<void>(`/admin/users/${userId}/unban`);
}

// Delete post (admin)
export async function deletePost(postId: string, reason?: string): Promise<void> {
  await http.delete<void>(`/admin/posts/${postId}`, { data: { reason } });
}

// Feature post
export async function featurePost(postId: string): Promise<void> {
  await http.post<void>(`/admin/posts/${postId}/feature`);
}

// Unfeature post
export async function unfeaturePost(postId: string): Promise<void> {
  await http.post<void>(`/admin/posts/${postId}/unfeature`);
}

// ============================================================================
// F12 Admin Console API
// ============================================================================

/**
 * Fetch admin users with advanced filters
 */
export async function fetchAdminUsers(filters: AdminUserFilters): Promise<AdminUsersResponse> {
  const response = await http.get<AdminUsersResponse>('/admin/v2/users', {
    params: filters,
  });
  return adminUsersResponseSchema.parse(response);
}

/**
 * Fetch admin posts with advanced filters
 */
export async function fetchAdminPosts(filters: AdminPostFilters): Promise<AdminPostsResponse> {
  const response = await http.get<AdminPostsResponse>('/admin/v2/posts', {
    params: filters,
  });
  return adminPostsResponseSchema.parse(response);
}

/**
 * Fetch admin reports with advanced filters
 */
export async function fetchAdminReports(filters: AdminReportFilters): Promise<AdminReportsResponse> {
  const response = await http.get<AdminReportsResponse>('/admin/reports', {
    params: filters,
  });
  return adminReportsResponseSchema.parse(response);
}

/**
 * Ban user with reason
 */
export async function banUserV2({ userId, reason }: BanUserParams): Promise<void> {
  await http.post<void>(`/admin/v2/users/${userId}/ban`, { reason });
}

/**
 * Unban user
 */
export async function unbanUserV2({ userId }: UnbanUserParams): Promise<void> {
  await http.post<void>(`/admin/v2/users/${userId}/unban`);
}

/**
 * Bulk ban users
 */
export async function bulkBanUsers({ ids }: BulkActionParams, reason: string): Promise<void> {
  await http.post<void>('/admin/v2/users/bulk/ban', { userIds: ids, reason });
}

/**
 * Bulk unban users
 */
export async function bulkUnbanUsers({ ids }: BulkActionParams): Promise<void> {
  await http.post<void>('/admin/v2/users/bulk/unban', { userIds: ids });
}

/**
 * Takedown post with reason
 */
export async function takedownPost({ postId, reason }: TakedownPostParams): Promise<void> {
  await http.post<void>(`/admin/v2/posts/${postId}/takedown`, { reason });
}

/**
 * Restore taken down post
 */
export async function restorePost({ postId }: RestorePostParams): Promise<void> {
  await http.post<void>(`/admin/v2/posts/${postId}/restore`);
}

/**
 * Bulk takedown posts
 */
export async function bulkTakedownPosts({ ids }: BulkActionParams, reason: string): Promise<void> {
  await http.post<void>('/admin/v2/posts/bulk/takedown', { postIds: ids, reason });
}

/**
 * Bulk restore posts
 */
export async function bulkRestorePosts({ ids }: BulkActionParams): Promise<void> {
  await http.post<void>('/admin/v2/posts/bulk/restore', { postIds: ids });
}

/**
 * Resolve report
 */
export async function resolveReport({ reportId, note }: ResolveReportParams): Promise<void> {
  await http.post<void>(`/admin/reports/${reportId}/resolve`, { note });
}

/**
 * Assign report to current user or unassign
 */
export async function assignReport({ reportId, assignToMe }: AssignReportParams): Promise<void> {
  await http.post<void>(`/admin/reports/${reportId}/assign`, { assignToMe });
}

/**
 * Bulk resolve reports
 */
export async function bulkResolveReports({ ids }: BulkActionParams): Promise<void> {
  await http.post<void>('/admin/reports/bulk/resolve', { reportIds: ids });
}

// ============================================================================
// KYC API
// ============================================================================

export async function getKYCSubmissions(params?: {
  page?: number;
  limit?: number;
  status?: string;
}) {
  return await http.get('/admin/kyc', { params });
}

export async function getKYCSubmissionById(submissionId: string) {
  return await http.get(`/admin/kyc/${submissionId}`);
}

export async function approveKYC(submissionId: string) {
  return await http.post(`/admin/kyc/${submissionId}/approve`);
}

export async function rejectKYC(submissionId: string, reason: string) {
  return await http.post(`/admin/kyc/${submissionId}/reject`, { reason });
}

// ============================================================================
// PAYOUTS API
// ============================================================================

export async function getPayouts(params?: {
  page?: number;
  limit?: number;
  status?: string;
  creatorId?: string;
}) {
  return await http.get('/admin/payouts', { params });
}

export async function getPayoutById(payoutId: string) {
  return await http.get(`/admin/payouts/${payoutId}`);
}

export async function approvePayout(payoutId: string) {
  return await http.post(`/admin/payouts/${payoutId}/approve`);
}

export async function rejectPayout(payoutId: string, reason: string) {
  return await http.post(`/admin/payouts/${payoutId}/reject`, { reason });
}

// ============================================================================
// CHARGEBACKS API
// ============================================================================

export async function getChargebacks(params?: {
  page?: number;
  limit?: number;
  status?: string;
}) {
  return await http.get('/admin/chargebacks', { params });
}

export async function getChargebackById(chargebackId: string) {
  return await http.get(`/admin/chargebacks/${chargebackId}`);
}

export async function acceptChargeback(chargebackId: string) {
  return await http.post(`/admin/chargebacks/${chargebackId}/accept`);
}

export async function rejectChargeback(chargebackId: string, evidence: string) {
  return await http.post(`/admin/chargebacks/${chargebackId}/reject`, { evidence });
}

// ============================================================================
// LEGAL API
// ============================================================================

export async function getLegalRequests(params?: {
  page?: number;
  limit?: number;
  status?: string;
  type?: string;
}) {
  return await http.get('/admin/legal', { params });
}

export async function getLegalRequestById(requestId: string) {
  return await http.get(`/admin/legal/${requestId}`);
}

export async function approveLegalRequest(requestId: string, actionTaken: string) {
  return await http.post(`/admin/legal/${requestId}/approve`, { actionTaken });
}

export async function rejectLegalRequest(requestId: string, reason: string) {
  return await http.post(`/admin/legal/${requestId}/reject`, { reason });
}

// ============================================================================
// HEALTH API
// ============================================================================

export async function getHealthStatus() {
  return await http.get('/health');
}

export async function getHealthChecks() {
  return await http.get('/admin/health/checks');
}

export async function getServiceHealth(serviceName: string) {
  return await http.get(`/admin/health/${serviceName}`);
}

export async function restartService(serviceName: string) {
  return await http.post(`/admin/health/${serviceName}/restart`);
}

// ============================================================================
// TICKETS API (Support)
// ============================================================================

export async function getTickets(params?: {
  page?: number;
  limit?: number;
  status?: string;
  priority?: string;
}) {
  return await http.get('/admin/tickets', { params });
}

export async function getTicketById(ticketId: string) {
  return await http.get(`/admin/tickets/${ticketId}`);
}

export async function assignTicket(ticketId: string, assignedTo: string) {
  return await http.post(`/admin/tickets/${ticketId}/assign`, { assignedTo });
}

export async function closeTicket(ticketId: string) {
  return await http.post(`/admin/tickets/${ticketId}/close`);
}

// ============================================================================
// ACCOUNTING API
// ============================================================================

export async function getAccountingStats(params?: {
  startDate?: string;
  endDate?: string;
}) {
  return await http.get('/admin/accounting/stats', { params });
}

export async function getAccountingSummary() {
  return await http.get('/admin/accounting/summary');
}

export async function exportAccountingReport(format: 'pdf' | 'csv' | 'xlsx', params?: {
  startDate?: string;
  endDate?: string;
}) {
  return await http.post('/admin/accounting/export', { format, ...params }, {
    responseType: 'blob',
  });
}

// ============================================================================
// TRANSACTIONS API
// ============================================================================

export async function getTransactions(params?: {
  page?: number;
  limit?: number;
  type?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}) {
  return await http.get('/admin/transactions', { params });
}

export async function getTransactionById(transactionId: string) {
  return await http.get(`/admin/transactions/${transactionId}`);
}

export async function getTransactionsTrends(period: '7d' | '30d' | '90d') {
  return await http.get('/admin/transactions/trends', { params: { period } });
}

// ============================================================================
// AUDIT API
// ============================================================================

export async function getAuditLogs(params?: {
  page?: number;
  limit?: number;
  userId?: string;
  event?: string;
  startDate?: string;
  endDate?: string;
}) {
  return await http.get('/admin/audit', { params });
}

// ============================================================================
// DASHBOARD API
// ============================================================================

export async function getDashboardStats() {
  return await http.get('/admin/dashboard/stats');
}
