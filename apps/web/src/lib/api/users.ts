/**
 * Admin Users API
 */

import { http } from '@/lib/http';
import type {
  UsersQuery,
  UsersListResponseDto,
  AdminUserDto,
  UserDetailDto,
  UserStatsDto,
  UpdateUserDto,
  BanUserDto,
  SuspendUserDto,
  BulkActionDto,
  BulkActionResponseDto,
} from '@/lib/api/types';

// ============================================================================
// Query Keys
// ============================================================================

export const usersKeys = {
  all: ['admin', 'users'] as const,
  lists: () => [...usersKeys.all, 'list'] as const,
  list: (query: UsersQuery) => [...usersKeys.lists(), query] as const,
  stats: () => [...usersKeys.all, 'stats'] as const,
  details: () => [...usersKeys.all, 'detail'] as const,
  detail: (id: string) => [...usersKeys.details(), id] as const,
};

// ============================================================================
// API Functions
// ============================================================================

/**
 * GET /admin/users
 * Get paginated list of users with filters
 */
export async function getUsers(query: UsersQuery = {}): Promise<UsersListResponseDto> {
  const response = await http.get<UsersListResponseDto>('/admin/users', {
    params: query,
  });
  return response;
}

/**
 * GET /admin/users/stats
 * Get user statistics
 */
export async function getUserStats(): Promise<UserStatsDto> {
  const response = await http.get<UserStatsDto>('/admin/users/stats');
  return response;
}

/**
 * GET /admin/users/:id
 * Get user detail by ID
 */
export async function getUserDetail(userId: string): Promise<UserDetailDto> {
  const response = await http.get<UserDetailDto>(`/admin/users/${userId}`);
  return response;
}

/**
 * PUT /admin/users/:id
 * Update user
 */
export async function updateUser(userId: string, data: UpdateUserDto): Promise<AdminUserDto> {
  const response = await http.put<AdminUserDto>(`/admin/users/${userId}`, data);
  return response;
}

/**
 * POST /admin/users/:id/ban
 * Ban user
 */
export async function banUser(userId: string, data: BanUserDto): Promise<{ message: string }> {
  const response = await http.post<{ message: string }>(`/admin/users/${userId}/ban`, data);
  return response;
}

/**
 * POST /admin/users/:id/unban
 * Unban user
 */
export async function unbanUser(userId: string): Promise<{ message: string }> {
  const response = await http.post<{ message: string }>(`/admin/users/${userId}/unban`);
  return response;
}

/**
 * POST /admin/users/:id/suspend
 * Suspend user
 */
export async function suspendUser(
  userId: string,
  data: SuspendUserDto
): Promise<{ message: string }> {
  const response = await http.post<{ message: string }>(`/admin/users/${userId}/suspend`, data);
  return response;
}

/**
 * POST /admin/users/:id/unsuspend
 * Unsuspend user
 */
export async function unsuspendUser(userId: string): Promise<{ message: string }> {
  const response = await http.post<{ message: string }>(`/admin/users/${userId}/unsuspend`);
  return response;
}

/**
 * POST /admin/users/bulk
 * Bulk action on users
 */
export async function bulkActionUsers(data: BulkActionDto): Promise<BulkActionResponseDto> {
  const response = await http.post<BulkActionResponseDto>('/admin/users/bulk', data);
  return response;
}
