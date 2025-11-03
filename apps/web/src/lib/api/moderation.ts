import { http } from '../http';
import type {
  ModerationQueueQuery,
  ModerationQueueResponse,
  ModerationStats,
  ApproveContentRequest,
  RejectContentRequest,
  EscalateContentRequest,
  BulkModerationActionRequest,
  BulkModerationActionResponse,
} from '@/types/moderation';

// ============================================================================
// React Query Keys
// ============================================================================

export const moderationKeys = {
  all: ['admin', 'moderation'] as const,
  queues: () => [...moderationKeys.all, 'queue'] as const,
  queue: (query: ModerationQueueQuery) => [...moderationKeys.queues(), query] as const,
  stats: () => [...moderationKeys.all, 'stats'] as const,
};

// ============================================================================
// API Functions
// ============================================================================

/**
 * Get moderation queue
 */
export async function getModerationQueue(
  query: ModerationQueueQuery = {}
): Promise<ModerationQueueResponse> {
  return await http.get<ModerationQueueResponse>('/admin/moderation', {
    params: query,
  });
}

/**
 * Get moderation statistics
 */
export async function getModerationStats(): Promise<ModerationStats> {
  return await http.get<ModerationStats>('/admin/moderation/stats');
}

/**
 * Approve content
 */
export async function approveContent(
  itemId: string,
  data: ApproveContentRequest
): Promise<void> {
  return await http.post<void>(`/admin/moderation/${itemId}/approve`, data);
}

/**
 * Reject content
 */
export async function rejectContent(
  itemId: string,
  data: RejectContentRequest
): Promise<void> {
  return await http.post<void>(`/admin/moderation/${itemId}/reject`, data);
}

/**
 * Escalate content
 */
export async function escalateContent(
  itemId: string,
  data: EscalateContentRequest
): Promise<void> {
  return await http.post<void>(`/admin/moderation/${itemId}/escalate`, data);
}

/**
 * Assign moderation item
 */
export async function assignModerationItem(
  itemId: string,
  assignedToId: string
): Promise<void> {
  return await http.post<void>(`/admin/moderation/${itemId}/assign`, {
    assignedToId,
  });
}

/**
 * Bulk moderation action
 */
export async function bulkModerationAction(
  data: BulkModerationActionRequest
): Promise<BulkModerationActionResponse> {
  return await http.post<BulkModerationActionResponse>(
    '/admin/moderation/bulk',
    data
  );
}
