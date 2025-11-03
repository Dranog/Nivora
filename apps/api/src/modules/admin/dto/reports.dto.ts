import { z } from 'zod';

// Enums from schema.admin.prisma
export enum ReportType {
  USER = 'USER',
  POST = 'POST',
  COMMENT = 'COMMENT',
  MESSAGE = 'MESSAGE',
}

export enum ReportPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum ReportSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum ReportStatus {
  PENDING = 'PENDING',
  UNDER_REVIEW = 'UNDER_REVIEW',
  RESOLVED = 'RESOLVED',
  DISMISSED = 'DISMISSED',
  ESCALATED = 'ESCALATED',
}

// ============================================================================
// Query & Filter Schemas
// ============================================================================

export const reportsQuerySchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  type: z.nativeEnum(ReportType).optional(),
  severity: z.nativeEnum(ReportSeverity).optional(),
  status: z.nativeEnum(ReportStatus).optional(),
  assignedToId: z.string().optional(),
  sortBy: z.enum(['createdAt', 'severity', 'status']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  createdFrom: z.string().datetime().optional(),
  createdTo: z.string().datetime().optional(),
});

export type ReportsQuery = z.infer<typeof reportsQuerySchema>;

// ============================================================================
// Report Response DTOs
// ============================================================================

export const reportSchema = z.object({
  id: z.string(),
  reporterId: z.string(),
  reporter: z.object({
    id: z.string(),
    username: z.string(),
    email: z.string(),
    avatar: z.string().nullable(),
  }),
  targetType: z.nativeEnum(ReportType),
  targetId: z.string(),
  targetUserId: z.string().nullable(),
  targetUser: z.object({
    id: z.string(),
    username: z.string(),
    email: z.string(),
    avatar: z.string().nullable(),
  }).nullable(),
  severity: z.nativeEnum(ReportSeverity),
  status: z.nativeEnum(ReportStatus),
  reason: z.string(),
  description: z.string().nullable(),
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
  resolution: z.string().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type ReportDto = z.infer<typeof reportSchema>;

export const reportsListResponseSchema = z.object({
  reports: z.array(reportSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
});

export type ReportsListResponseDto = z.infer<typeof reportsListResponseSchema>;

// ============================================================================
// Report Stats DTO
// ============================================================================

export const reportStatsSchema = z.object({
  totalReports: z.number().int().nonnegative(),
  pendingReports: z.number().int().nonnegative(),
  inReviewReports: z.number().int().nonnegative(),
  resolvedReports: z.number().int().nonnegative(),
  dismissedReports: z.number().int().nonnegative(),
  criticalReports: z.number().int().nonnegative(),
  highSeverityReports: z.number().int().nonnegative(),
  newReportsToday: z.number().int().nonnegative(),
  newReportsThisWeek: z.number().int().nonnegative(),
  averageResolutionTime: z.number().nonnegative(), // in hours
});

export type ReportStatsDto = z.infer<typeof reportStatsSchema>;

// ============================================================================
// Create Report DTO
// ============================================================================

export const createReportSchema = z.object({
  targetType: z.nativeEnum(ReportType),
  targetId: z.string(),
  reason: z.string().min(10).max(200),
  description: z.string().max(2000).optional(),
  severity: z.nativeEnum(ReportSeverity).default(ReportSeverity.MEDIUM),
});

export type CreateReportDto = z.infer<typeof createReportSchema>;

// ============================================================================
// Update Report DTO
// ============================================================================

export const updateReportSchema = z.object({
  status: z.nativeEnum(ReportStatus).optional(),
  severity: z.nativeEnum(ReportSeverity).optional(),
  assignedToId: z.string().nullable().optional(),
  resolution: z.string().max(2000).optional(),
});

export type UpdateReportDto = z.infer<typeof updateReportSchema>;

// ============================================================================
// Resolve Report DTO
// ============================================================================

export const resolveReportSchema = z.object({
  resolution: z.string().min(10).max(2000),
  action: z.enum([
    'NO_ACTION',
    'WARNING_SENT',
    'CONTENT_REMOVED',
    'USER_SUSPENDED',
    'USER_BANNED',
  ]),
  notifyReporter: z.boolean().default(true),
});

export type ResolveReportDto = z.infer<typeof resolveReportSchema>;

// ============================================================================
// Dismiss Report DTO
// ============================================================================

export const dismissReportSchema = z.object({
  reason: z.string().min(10).max(1000),
  notifyReporter: z.boolean().default(false),
});

export type DismissReportDto = z.infer<typeof dismissReportSchema>;

// ============================================================================
// Assign Report DTO
// ============================================================================

export const assignReportSchema = z.object({
  assignedToId: z.string(),
});

export type AssignReportDto = z.infer<typeof assignReportSchema>;

// ============================================================================
// Bulk Actions DTOs
// ============================================================================

export const bulkReportActionSchema = z.object({
  reportIds: z.array(z.string()).min(1).max(100),
  action: z.enum(['assign', 'dismiss', 'mark_in_review']),
  assignedToId: z.string().optional(),
  reason: z.string().max(1000).optional(),
});

export type BulkReportActionDto = z.infer<typeof bulkReportActionSchema>;

export const bulkReportActionResponseSchema = z.object({
  success: z.number().int().nonnegative(),
  failed: z.number().int().nonnegative(),
  errors: z.array(
    z.object({
      reportId: z.string(),
      error: z.string(),
    })
  ),
});

export type BulkReportActionResponseDto = z.infer<typeof bulkReportActionResponseSchema>;

// ============================================================================
// Report Detail DTO (Extended with target content)
// ============================================================================

export const reportDetailSchema = reportSchema.extend({
  targetContent: z.any().nullable(), // Can be Post, Comment, Message, or User data
  moderationHistory: z.array(
    z.object({
      id: z.string(),
      action: z.string(),
      performedBy: z.object({
        id: z.string(),
        username: z.string(),
      }),
      timestamp: z.string().datetime(),
      notes: z.string().nullable(),
    })
  ),
  relatedReports: z.array(
    z.object({
      id: z.string(),
      reason: z.string(),
      status: z.nativeEnum(ReportStatus),
      createdAt: z.string().datetime(),
    })
  ),
});

export type ReportDetailDto = z.infer<typeof reportDetailSchema>;
