import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminToasts, showBulkActionResult } from '@/lib/toasts';
import {
  getModerationQueue,
  getModerationStats,
  approveContent,
  rejectContent,
  escalateContent,
  assignModerationItem,
  bulkModerationAction,
  moderationKeys,
} from '@/lib/api/moderation';
import type {
  ModerationQueueQuery,
  ApproveContentRequest,
  RejectContentRequest,
  EscalateContentRequest,
  BulkModerationActionRequest,
} from '@/types/moderation';

// ============================================================================
// Queries
// ============================================================================

/**
 * Hook to fetch moderation queue
 */
export function useModerationQueue(query: ModerationQueueQuery = {}) {
  return useQuery({
    queryKey: moderationKeys.queue(query),
    queryFn: () => getModerationQueue(query),
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Hook to fetch moderation statistics
 */
export function useModerationStats() {
  return useQuery({
    queryKey: moderationKeys.stats(),
    queryFn: () => getModerationStats(),
    staleTime: 60 * 1000, // 1 minute
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
}

// ============================================================================
// Mutations
// ============================================================================

/**
 * Hook to approve content
 */
export function useApproveContent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      itemId,
      data,
    }: {
      itemId: string;
      data: ApproveContentRequest;
    }) => approveContent(itemId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: moderationKeys.queues() });
      queryClient.invalidateQueries({ queryKey: moderationKeys.stats() });
      adminToasts.moderation.approved();
    },
    onError: (error: any) => {
      adminToasts.moderation.approveFailed(error?.message);
    },
  });
}

/**
 * Hook to reject content
 */
export function useRejectContent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      itemId,
      data,
    }: {
      itemId: string;
      data: RejectContentRequest;
    }) => rejectContent(itemId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: moderationKeys.queues() });
      queryClient.invalidateQueries({ queryKey: moderationKeys.stats() });
      adminToasts.moderation.rejected();
    },
    onError: (error: any) => {
      adminToasts.moderation.rejectFailed(error?.message);
    },
  });
}

/**
 * Hook to escalate content
 */
export function useEscalateContent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      itemId,
      data,
    }: {
      itemId: string;
      data: EscalateContentRequest;
    }) => escalateContent(itemId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: moderationKeys.queues() });
      queryClient.invalidateQueries({ queryKey: moderationKeys.stats() });
      adminToasts.moderation.escalated();
    },
    onError: (error: any) => {
      adminToasts.moderation.escalateFailed(error?.message);
    },
  });
}

/**
 * Hook to assign moderation item
 */
export function useAssignModerationItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      itemId,
      assignedToId,
    }: {
      itemId: string;
      assignedToId: string;
    }) => assignModerationItem(itemId, assignedToId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: moderationKeys.queues() });
      adminToasts.moderation.assigned();
    },
    onError: (error: any) => {
      adminToasts.moderation.assignFailed(error?.message);
    },
  });
}

/**
 * Hook to perform bulk moderation actions
 */
export function useBulkModerationAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BulkModerationActionRequest) =>
      bulkModerationAction(data),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: moderationKeys.queues() });
      queryClient.invalidateQueries({ queryKey: moderationKeys.stats() });

      const total = result.success + result.failed;
      if (result.failed === 0) {
        adminToasts.moderation.bulkCompleted(result.success);
      } else {
        adminToasts.moderation.bulkPartialSuccess(result.success, result.failed, total);
      }
    },
    onError: (error: any) => {
      adminToasts.moderation.bulkFailed(error?.message);
    },
  });
}
