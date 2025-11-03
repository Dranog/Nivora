/**
 * Admin Users Hooks
 * React Query hooks for user management
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
} from '@tanstack/react-query';
import {
  getUsers,
  getUserStats,
  getUserDetail,
  updateUser,
  banUser,
  unbanUser,
  suspendUser,
  unsuspendUser,
  bulkActionUsers,
  usersKeys,
} from '@/lib/api/users';
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
import { toast } from 'sonner';

/**
 * Hook: Get paginated list of users
 */
export function useUsers(
  query: UsersQuery = {},
  options?: Omit<UseQueryOptions<UsersListResponseDto, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: usersKeys.list(query),
    queryFn: () => getUsers(query),
    staleTime: 30 * 1000, // 30 seconds
    ...options,
  });
}

/**
 * Hook: Get user statistics
 */
export function useUserStats(
  options?: Omit<UseQueryOptions<UserStatsDto, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: usersKeys.stats(),
    queryFn: getUserStats,
    staleTime: 60 * 1000, // 1 minute
    ...options,
  });
}

/**
 * Hook: Get user detail
 */
export function useUserDetail(
  userId: string,
  options?: Omit<UseQueryOptions<UserDetailDto, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: usersKeys.detail(userId),
    queryFn: () => getUserDetail(userId),
    enabled: !!userId,
    staleTime: 30 * 1000, // 30 seconds
    ...options,
  });
}

/**
 * Hook: Update user
 */
export function useUpdateUser(
  options?: Omit<
    UseMutationOptions<AdminUserDto, Error, { userId: string; data: UpdateUserDto }>,
    'mutationFn'
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: UpdateUserDto }) =>
      updateUser(userId, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
      queryClient.invalidateQueries({ queryKey: usersKeys.detail(variables.userId) });

      toast.success('Utilisateur modifié', {
        description: 'Les informations ont été mises à jour avec succès.',
      });
    },
    ...options,
  });
}

/**
 * Hook: Ban user
 */
export function useBanUser(
  options?: Omit<
    UseMutationOptions<{ message: string }, Error, { userId: string; data: BanUserDto }>,
    'mutationFn'
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: BanUserDto }) =>
      banUser(userId, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
      queryClient.invalidateQueries({ queryKey: usersKeys.detail(variables.userId) });

      toast.success('Utilisateur banni', {
        description: 'L\'utilisateur a été banni avec succès.',
      });
    },
    ...options,
  });
}

/**
 * Hook: Unban user
 */
export function useUnbanUser(
  options?: Omit<UseMutationOptions<{ message: string }, Error, string>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => unbanUser(userId),
    onSuccess: (data, userId) => {
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
      queryClient.invalidateQueries({ queryKey: usersKeys.detail(userId) });

      toast.success('Utilisateur débanni', {
        description: 'L\'utilisateur a été débanni avec succès.',
      });
    },
    ...options,
  });
}

/**
 * Hook: Suspend user
 */
export function useSuspendUser(
  options?: Omit<
    UseMutationOptions<{ message: string }, Error, { userId: string; data: SuspendUserDto }>,
    'mutationFn'
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: SuspendUserDto }) =>
      suspendUser(userId, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
      queryClient.invalidateQueries({ queryKey: usersKeys.detail(variables.userId) });

      toast.success('Utilisateur suspendu', {
        description: 'L\'utilisateur a été suspendu avec succès.',
      });
    },
    ...options,
  });
}

/**
 * Hook: Unsuspend user
 */
export function useUnsuspendUser(
  options?: Omit<UseMutationOptions<{ message: string }, Error, string>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => unsuspendUser(userId),
    onSuccess: (data, userId) => {
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
      queryClient.invalidateQueries({ queryKey: usersKeys.detail(userId) });

      toast.success('Suspension levée', {
        description: 'La suspension de l\'utilisateur a été levée avec succès.',
      });
    },
    ...options,
  });
}

/**
 * Hook: Bulk action on users
 */
export function useBulkActionUsers(
  options?: Omit<UseMutationOptions<BulkActionResponseDto, Error, BulkActionDto>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BulkActionDto) => bulkActionUsers(data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
      queryClient.invalidateQueries({ queryKey: usersKeys.stats() });

      const { success, failed } = data;
      if (failed === 0) {
        toast.success('Action groupée terminée', {
          description: `Action effectuée sur ${success} utilisateur(s) avec succès.`,
        });
      } else {
        toast.warning('Action groupée partiellement terminée', {
          description: `${success} réussis, ${failed} échoués.`,
        });
      }
    },
    ...options,
  });
}
