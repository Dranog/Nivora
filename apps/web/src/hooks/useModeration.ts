/**
 * Admin Moderation Hooks
 * React Query hooks for content moderation management
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
} from '@tanstack/react-query';
import { http } from '@/lib/http';
import { toast } from 'sonner';
import type {
  ModerationItemDto,
  ModerationQueueQuery,
  ModerationQueueResponseDto,
  ModerationStatsDto,
  ApproveContentDto,
  RejectContentDto,
  EscalateContentDto,
  BulkModerationActionDto,
  BulkModerationActionResponseDto,
} from '@/lib/api/types';

// ============================================================================
// Query Keys
// ============================================================================

export const moderationKeys = {
  all: ['admin', 'moderation'] as const,
  lists: () => [...moderationKeys.all, 'list'] as const,
  list: (query: ModerationQueueQuery) => [...moderationKeys.lists(), query] as const,
  details: () => [...moderationKeys.all, 'detail'] as const,
  detail: (id: string) => [...moderationKeys.details(), id] as const,
  stats: () => [...moderationKeys.all, 'stats'] as const,
};

// ============================================================================
// API Functions
// ============================================================================

/**
 * GET /admin/moderation
 * Get moderation queue
 */
async function getModerationQueue(query: ModerationQueueQuery = {}): Promise<ModerationQueueResponseDto> {
  const response = await http.get<ModerationQueueResponseDto>('/admin/moderation', {
    params: query,
  });
  return response;
}

/**
 * GET /admin/moderation/stats
 * Get moderation statistics
 */
async function getModerationStats(): Promise<ModerationStatsDto> {
  const response = await http.get<ModerationStatsDto>('/admin/moderation/stats');
  return response;
}

/**
 * POST /admin/moderation/:id/approve
 * Approve content
 */
async function approveContent(itemId: string, data: ApproveContentDto): Promise<void> {
  await http.post(`/admin/moderation/${itemId}/approve`, data);
}

/**
 * POST /admin/moderation/:id/reject
 * Reject content
 */
async function rejectContent(itemId: string, data: RejectContentDto): Promise<void> {
  await http.post(`/admin/moderation/${itemId}/reject`, data);
}

/**
 * POST /admin/moderation/:id/escalate
 * Escalate content to senior moderator
 */
async function escalateContent(itemId: string, data: EscalateContentDto): Promise<void> {
  await http.post(`/admin/moderation/${itemId}/escalate`, data);
}

/**
 * POST /admin/moderation/:id/assign
 * Assign content to moderator
 */
async function assignModerator(itemId: string, assignedToId: string): Promise<void> {
  await http.post(`/admin/moderation/${itemId}/assign`, { assignedToId });
}

/**
 * POST /admin/moderation/bulk
 * Bulk action on multiple items
 */
async function bulkModerationAction(data: BulkModerationActionDto): Promise<BulkModerationActionResponseDto> {
  const response = await http.post<BulkModerationActionResponseDto>('/admin/moderation/bulk', data);
  return response;
}

// ============================================================================
// Hooks
// ============================================================================

/**
 * Hook: Get moderation queue
 */
export function useModerationQueue(
  query: ModerationQueueQuery = {},
  options?: Omit<UseQueryOptions<ModerationQueueResponseDto, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: moderationKeys.list(query),
    queryFn: () => getModerationQueue(query),
    staleTime: 10 * 1000, // 10 seconds (short because real-time)
    ...options,
  });
}

/**
 * Hook: Get moderation statistics
 */
export function useModerationStats(
  options?: Omit<UseQueryOptions<ModerationStatsDto, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: moderationKeys.stats(),
    queryFn: getModerationStats,
    staleTime: 30 * 1000, // 30 seconds
    ...options,
  });
}

/**
 * Hook: Approve content
 */
export function useApproveContent(
  options?: Omit<
    UseMutationOptions<void, Error, { itemId: string; note?: string }>,
    'mutationFn'
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itemId, note }: { itemId: string; note?: string }) =>
      approveContent(itemId, { note }),
    onMutate: async ({ itemId }) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: moderationKeys.lists() });

      // Optimistically update queue
      const previousData = queryClient.getQueriesData({ queryKey: moderationKeys.lists() });

      queryClient.setQueriesData<ModerationQueueResponseDto>(
        { queryKey: moderationKeys.lists() },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            items: old.items.filter((item) => item.id !== itemId),
            total: old.total - 1,
          };
        }
      );

      return { previousData } as any;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: moderationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: moderationKeys.stats() });

      toast.success('Contenu approuvé', {
        description: 'Le contenu a été approuvé et publié.',
      });
    },
    onError: (error, variables, context) => {
      // Rollback on error
      const ctx = context as any;
      if (ctx?.previousData) {
        ctx.previousData.forEach(([queryKey, data]: [any, any]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    ...options,
  });
}

/**
 * Hook: Reject content
 */
export function useRejectContent(
  options?: Omit<
    UseMutationOptions<void, Error, { itemId: string; reason: string; severity: 'LOW' | 'MEDIUM' | 'HIGH'; action: 'DELETE' | 'WARN' | 'SUSPEND' | 'BAN' }>,
    'mutationFn'
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itemId, reason, severity, action }) =>
      rejectContent(itemId, { reason, severity, action }),
    onMutate: async ({ itemId }) => {
      await queryClient.cancelQueries({ queryKey: moderationKeys.lists() });

      const previousData = queryClient.getQueriesData({ queryKey: moderationKeys.lists() });

      queryClient.setQueriesData<ModerationQueueResponseDto>(
        { queryKey: moderationKeys.lists() },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            items: old.items.filter((item) => item.id !== itemId),
            total: old.total - 1,
          };
        }
      );

      return { previousData } as any;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: moderationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: moderationKeys.stats() });

      toast.success('Contenu rejeté', {
        description: 'Le contenu a été rejeté et supprimé.',
      });
    },
    onError: (error, variables, context) => {
      const ctx = context as any;
      if (ctx?.previousData) {
        ctx.previousData.forEach(([queryKey, data]: [any, any]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    ...options,
  });
}

/**
 * Hook: Escalate content (flag)
 */
export function useEscalateContent(
  options?: Omit<
    UseMutationOptions<void, Error, { itemId: string; reason: string; priority: 'HIGH' | 'URGENT' }>,
    'mutationFn'
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itemId, reason, priority }) =>
      escalateContent(itemId, { reason, priority }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: moderationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: moderationKeys.stats() });

      toast.success('Contenu signalé', {
        description: 'Le contenu a été escaladé pour révision approfondie.',
      });
    },
    ...options,
  });
}

/**
 * Hook: Assign moderator
 */
export function useAssignModerator(
  options?: Omit<
    UseMutationOptions<void, Error, { itemId: string; moderatorId: string }>,
    'mutationFn'
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itemId, moderatorId }) =>
      assignModerator(itemId, moderatorId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: moderationKeys.lists() });

      toast.success('Tâche assignée', {
        description: 'Le contenu a été assigné au modérateur.',
      });
    },
    ...options,
  });
}

/**
 * Hook: Bulk moderation action
 */
export function useBulkModerationAction(
  options?: Omit<UseMutationOptions<BulkModerationActionResponseDto, Error, BulkModerationActionDto>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BulkModerationActionDto) => bulkModerationAction(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: moderationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: moderationKeys.stats() });

      const { success, failed } = data;
      if (failed === 0) {
        toast.success('Action groupée terminée', {
          description: `${success} élément(s) traité(s) avec succès.`,
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
