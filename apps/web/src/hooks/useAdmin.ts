/**
 * Admin Hooks - F3 React Query + F12 Console
 */

import { useMutation, useQuery, useQueryClient, type UseQueryOptions, type UseMutationOptions } from '@tanstack/react-query';
import * as adminApi from '@/lib/api/admin';
import { adminKeys } from '@/lib/api/admin';
import type { AdminStats } from '@/lib/api/admin';
import type { UserList } from '@/types/user';
import type { PostList } from '@/types/post';
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
import { adminToasts } from '@/lib/toasts';

/**
 * Get admin stats
 */
export function useAdminStats(options?: Omit<UseQueryOptions<AdminStats, Error>, 'queryKey' | 'queryFn'>) {
  return useQuery({
    queryKey: adminKeys.stats(),
    queryFn: adminApi.getAdminStats,
    ...options,
  });
}

/**
 * Get all users (admin)
 */
export function useAdminUsers(
  params?: {
    page?: number;
    pageSize?: number;
    role?: string;
    search?: string;
  },
  options?: Omit<UseQueryOptions<UserList, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: adminKeys.usersList(params || {}),
    queryFn: () => adminApi.getUsers(params),
    ...options,
  });
}

/**
 * Get all posts (admin)
 */
export function useAdminPosts(
  params?: {
    page?: number;
    pageSize?: number;
    status?: string;
    search?: string;
  },
  options?: Omit<UseQueryOptions<PostList, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: adminKeys.postsList(params || {}),
    queryFn: () => adminApi.getPosts(params),
    ...options,
  });
}

/**
 * Ban user mutation
 */
export function useBanUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, reason }: { userId: string; reason?: string }) =>
      adminApi.banUser(userId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.users() });
      adminToasts.users.banned();
    },
    onError: (error) => {
      adminToasts.users.banFailed(error instanceof Error ? error.message : undefined);
    },
  });
}

/**
 * Unban user mutation
 */
export function useUnbanUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: adminApi.unbanUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.users() });
      adminToasts.users.unbanned();
    },
    onError: (error) => {
      adminToasts.users.unbanFailed(error instanceof Error ? error.message : undefined);
    },
  });
}

/**
 * Delete post (admin) mutation
 */
export function useAdminDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, reason }: { postId: string; reason?: string }) =>
      adminApi.deletePost(postId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.posts() });
      adminToasts.posts.deleted();
    },
    onError: (error) => {
      adminToasts.general.deleteFailed(error instanceof Error ? error.message : undefined);
    },
  });
}

// ============================================================================
// F12 Admin Console Hooks
// ============================================================================

/**
 * Default filters
 */
export const defaultAdminUserFilters: AdminUserFilters = {
  page: 1,
  limit: 20,
  sortBy: 'createdAt',
  sortOrder: 'desc',
};

export const defaultAdminPostFilters: AdminPostFilters = {
  page: 1,
  limit: 20,
  sortBy: 'createdAt',
  sortOrder: 'desc',
};

export const defaultAdminReportFilters: AdminReportFilters = {
  page: 1,
  limit: 20,
  sortBy: 'createdAt',
  sortOrder: 'desc',
};

/**
 * Fetch admin users with advanced filters
 */
export function useAdminUsersV2(
  filters: AdminUserFilters = defaultAdminUserFilters,
  options?: Omit<UseQueryOptions<AdminUsersResponse, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: adminKeys.adminUsers(filters),
    queryFn: () => adminApi.fetchAdminUsers(filters),
    staleTime: 30 * 1000, // 30 seconds
    ...options,
  });
}

/**
 * Fetch admin posts with advanced filters
 */
export function useAdminPostsV2(
  filters: AdminPostFilters = defaultAdminPostFilters,
  options?: Omit<UseQueryOptions<AdminPostsResponse, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: adminKeys.adminPosts(filters),
    queryFn: () => adminApi.fetchAdminPosts(filters),
    staleTime: 30 * 1000,
    ...options,
  });
}

/**
 * Fetch admin reports with advanced filters
 */
export function useAdminReports(
  filters: AdminReportFilters = defaultAdminReportFilters,
  options?: Omit<UseQueryOptions<AdminReportsResponse, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: adminKeys.adminReports(filters),
    queryFn: () => adminApi.fetchAdminReports(filters),
    staleTime: 30 * 1000,
    ...options,
  });
}

/**
 * Ban user V2 with consistent invalidation
 */
export function useBanUserV2(options?: UseMutationOptions<void, Error, BanUserParams>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: adminApi.banUserV2,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.users() });
      adminToasts.users.banned();
    },
    onError: (error) => {
      adminToasts.users.banFailed(error instanceof Error ? error.message : undefined);
    },
    ...options,
  });
}

/**
 * Unban user V2 with consistent invalidation
 */
export function useUnbanUserV2(options?: UseMutationOptions<void, Error, UnbanUserParams>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: adminApi.unbanUserV2,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.users() });
      adminToasts.users.unbanned();
    },
    onError: (error) => {
      adminToasts.users.unbanFailed(error instanceof Error ? error.message : undefined);
    },
    ...options,
  });
}

/**
 * Bulk ban users
 */
export function useBulkBanUsers(options?: UseMutationOptions<void, Error, { ids: string[]; reason: string }>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ids, reason }) => adminApi.bulkBanUsers({ ids }, reason),
    onSuccess: (_, { ids }) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.users() });
      adminToasts.users.bulkBanned(ids.length);
    },
    onError: (error) => {
      adminToasts.users.banFailed(error instanceof Error ? error.message : undefined);
    },
    ...options,
  });
}

/**
 * Bulk unban users
 */
export function useBulkUnbanUsers(options?: UseMutationOptions<void, Error, BulkActionParams>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: adminApi.bulkUnbanUsers,
    onSuccess: (_, { ids }) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.users() });
      adminToasts.users.bulkUnbanned(ids.length);
    },
    onError: (error) => {
      adminToasts.users.unbanFailed(error instanceof Error ? error.message : undefined);
    },
    ...options,
  });
}

/**
 * Takedown post
 */
export function useTakedownPost(options?: UseMutationOptions<void, Error, TakedownPostParams>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: adminApi.takedownPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.posts() });
      adminToasts.posts.takenDown();
    },
    onError: (error) => {
      adminToasts.posts.takedownFailed(error instanceof Error ? error.message : undefined);
    },
    ...options,
  });
}

/**
 * Restore post
 */
export function useRestorePost(options?: UseMutationOptions<void, Error, RestorePostParams>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: adminApi.restorePost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.posts() });
      adminToasts.posts.restored();
    },
    onError: (error) => {
      adminToasts.posts.restoreFailed(error instanceof Error ? error.message : undefined);
    },
    ...options,
  });
}

/**
 * Bulk takedown posts
 */
export function useBulkTakedownPosts(options?: UseMutationOptions<void, Error, { ids: string[]; reason: string }>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ids, reason }) => adminApi.bulkTakedownPosts({ ids }, reason),
    onSuccess: (_, { ids }) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.posts() });
      adminToasts.posts.bulkTakenDown(ids.length);
    },
    onError: (error) => {
      adminToasts.posts.takedownFailed(error instanceof Error ? error.message : undefined);
    },
    ...options,
  });
}

/**
 * Bulk restore posts
 */
export function useBulkRestorePosts(options?: UseMutationOptions<void, Error, BulkActionParams>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: adminApi.bulkRestorePosts,
    onSuccess: (_, { ids }) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.posts() });
      adminToasts.posts.bulkRestored(ids.length);
    },
    onError: (error) => {
      adminToasts.posts.restoreFailed(error instanceof Error ? error.message : undefined);
    },
    ...options,
  });
}

/**
 * Resolve report
 */
export function useResolveReport(options?: UseMutationOptions<void, Error, ResolveReportParams>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: adminApi.resolveReport,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.reports() });
      adminToasts.reports.resolved();
    },
    onError: (error) => {
      adminToasts.reports.resolveFailed(error instanceof Error ? error.message : undefined);
    },
    ...options,
  });
}

/**
 * Assign report
 */
export function useAssignReport(options?: UseMutationOptions<void, Error, AssignReportParams>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: adminApi.assignReport,
    onSuccess: (_, { assignToMe }) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.reports() });
      if (assignToMe) {
        adminToasts.reports.assigned();
      } else {
        adminToasts.reports.unassigned();
      }
    },
    onError: (error) => {
      adminToasts.reports.resolveFailed(error instanceof Error ? error.message : undefined);
    },
    ...options,
  });
}

/**
 * Bulk resolve reports
 */
export function useBulkResolveReports(options?: UseMutationOptions<void, Error, BulkActionParams>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: adminApi.bulkResolveReports,
    onSuccess: (_, { ids }) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.reports() });
      adminToasts.reports.bulkResolved(ids.length);
    },
    onError: (error) => {
      adminToasts.reports.resolveFailed(error instanceof Error ? error.message : undefined);
    },
    ...options,
  });
}
