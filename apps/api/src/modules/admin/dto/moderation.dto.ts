import { z } from 'zod';
import { ReportPriority } from './reports.dto';

// Enums from schema.admin.prisma
export enum ModerationPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum ModerationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  ESCALATED = 'ESCALATED',
}

// ============================================================================
// Query & Filter Schemas
// ============================================================================

export const moderationQueueQuerySchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  priority: z.nativeEnum(ReportPriority).optional(),
  status: z.nativeEnum(ModerationStatus).optional(),
  assignedToId: z.string().optional(),
  contentType: z.enum(['POST', 'COMMENT', 'USER', 'MESSAGE']).optional(),
  sortBy: z.enum(['createdAt', 'priority', 'status']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type ModerationQueueQuery = z.infer<typeof moderationQueueQuerySchema>;

// ============================================================================
// Moderation Decision DTOs
// ============================================================================

export const moderationDecisionSchema = z.object({
  id: z.string(),
  contentType: z.enum(['POST', 'COMMENT', 'USER', 'MESSAGE']),
  contentId: z.string(),
  priority: z.nativeEnum(ReportPriority),
  status: z.nativeEnum(ModerationStatus),
  assignedToId: z.string().nullable(),
  assignedTo: z.object({
    id: z.string(),
    username: z.string(),
    email: z.string(),
  }).nullable(),
  reviewedById: z.string().nullable(),
  reviewedBy: z.object({
    id: z.string(),
    username: z.string(),
    email: z.string(),
  }).nullable(),
  decision: z.string().nullable(),
  notes: z.string().nullable(),
  aiConfidence: z.number().nullable(),
  aiFlags: z.array(z.string()),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),

  // Content preview
  contentPreview: z.any().nullable(),
});

export type ModerationDecisionDto = z.infer<typeof moderationDecisionSchema>;

export const moderationQueueResponseSchema = z.object({
  items: z.array(moderationDecisionSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
});

export type ModerationQueueResponseDto = z.infer<typeof moderationQueueResponseSchema>;

// ============================================================================
// Moderation Stats DTO
// ============================================================================

export const moderationStatsSchema = z.object({
  totalItems: z.number().int().nonnegative(),
  pendingItems: z.number().int().nonnegative(),
  approvedItems: z.number().int().nonnegative(),
  rejectedItems: z.number().int().nonnegative(),
  escalatedItems: z.number().int().nonnegative(),
  urgentItems: z.number().int().nonnegative(),
  highPriorityItems: z.number().int().nonnegative(),
  newItemsToday: z.number().int().nonnegative(),
  newItemsThisWeek: z.number().int().nonnegative(),
  averageReviewTime: z.number().nonnegative(), // in minutes
});

export type ModerationStatsDto = z.infer<typeof moderationStatsSchema>;

// ============================================================================
// Review Actions DTOs
// ============================================================================

export const approveContentSchema = z.object({
  notes: z.string().max(2000).optional(),
});

export type ApproveContentDto = z.infer<typeof approveContentSchema>;

export const rejectContentSchema = z.object({
  reason: z.string().min(10).max(2000),
  action: z.enum(['DELETE_CONTENT', 'SUSPEND_USER', 'BAN_USER', 'WARNING']),
  notifyUser: z.boolean().default(true),
});

export type RejectContentDto = z.infer<typeof rejectContentSchema>;

export const escalateContentSchema = z.object({
  reason: z.string().min(10).max(2000),
  escalateTo: z.string(),
});

export type EscalateContentDto = z.infer<typeof escalateContentSchema>;

// ============================================================================
// Bulk Actions DTOs
// ============================================================================

export const bulkModerationActionSchema = z.object({
  itemIds: z.array(z.string()).min(1).max(50),
  action: z.enum(['approve', 'reject', 'assign', 'escalate']),
  assignedToId: z.string().optional(),
  reason: z.string().max(1000).optional(),
});

export type BulkModerationActionDto = z.infer<typeof bulkModerationActionSchema>;

export const bulkModerationActionResponseSchema = z.object({
  success: z.number().int().nonnegative(),
  failed: z.number().int().nonnegative(),
  errors: z.array(
    z.object({
      itemId: z.string(),
      error: z.string(),
    })
  ),
});

export type BulkModerationActionResponseDto = z.infer<typeof bulkModerationActionResponseSchema>;
