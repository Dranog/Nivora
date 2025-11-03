/**
 * Admin Console Types (F12)
 * Types for admin user/post/report management
 */

import { z } from 'zod';

// ============================================================================
// Admin User Types
// ============================================================================

export const adminUserStatusSchema = z.enum(['active', 'banned', 'suspended']);
export type AdminUserStatus = z.infer<typeof adminUserStatusSchema>;

export const adminUserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  displayName: z.string().nullable(),
  role: z.enum(['fan', 'creator', 'admin']).nullable(),
  status: adminUserStatusSchema.default('active'),
  onboardingDone: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime().optional(),
  lastLoginAt: z.string().datetime().optional(),
  bannedAt: z.string().datetime().optional(),
  bannedReason: z.string().optional(),
  postsCount: z.number().default(0),
  reportsCount: z.number().default(0),
});

export type AdminUser = z.infer<typeof adminUserSchema>;

export const adminUserFiltersSchema = z.object({
  search: z.string().optional(),
  status: adminUserStatusSchema.optional(),
  role: z.enum(['fan', 'creator', 'admin']).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  sortBy: z.enum(['createdAt', 'email', 'displayName', 'postsCount', 'reportsCount']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type AdminUserFilters = z.infer<typeof adminUserFiltersSchema>;

export const adminUsersResponseSchema = z.object({
  users: z.array(adminUserSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});

export type AdminUsersResponse = z.infer<typeof adminUsersResponseSchema>;

// ============================================================================
// Admin Post Types
// ============================================================================

export const adminPostStatusSchema = z.enum(['draft', 'published', 'archived', 'taken_down']);
export type AdminPostStatus = z.infer<typeof adminPostStatusSchema>;

export const adminPostSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  authorId: z.string(),
  authorName: z.string(),
  authorEmail: z.string(),
  status: adminPostStatusSchema,
  visibility: z.enum(['public', 'followers', 'subscribers', 'private']),
  createdAt: z.string().datetime(),
  publishedAt: z.string().datetime().nullable(),
  takenDownAt: z.string().datetime().optional(),
  takenDownReason: z.string().optional(),
  viewsCount: z.number().default(0),
  likesCount: z.number().default(0),
  reportsCount: z.number().default(0),
});

export type AdminPost = z.infer<typeof adminPostSchema>;

export const adminPostFiltersSchema = z.object({
  search: z.string().optional(),
  status: adminPostStatusSchema.optional(),
  authorId: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  sortBy: z.enum(['createdAt', 'publishedAt', 'viewsCount', 'reportsCount']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type AdminPostFilters = z.infer<typeof adminPostFiltersSchema>;

export const adminPostsResponseSchema = z.object({
  posts: z.array(adminPostSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});

export type AdminPostsResponse = z.infer<typeof adminPostsResponseSchema>;

// ============================================================================
// Admin Report Types
// ============================================================================

export const reportTypeSchema = z.enum(['user', 'post', 'comment']);
export type ReportType = z.infer<typeof reportTypeSchema>;

export const reportStatusSchema = z.enum(['open', 'resolved', 'dismissed']);
export type ReportStatus = z.infer<typeof reportStatusSchema>;

export const reportReasonSchema = z.enum([
  'spam',
  'harassment',
  'hate_speech',
  'violence',
  'sexual_content',
  'misinformation',
  'copyright',
  'other',
]);
export type ReportReason = z.infer<typeof reportReasonSchema>;

export const adminReportSchema = z.object({
  id: z.string(),
  type: reportTypeSchema,
  reason: reportReasonSchema,
  description: z.string().optional(),
  status: reportStatusSchema.default('open'),
  reporterId: z.string(),
  reporterEmail: z.string(),
  reportedUserId: z.string().optional(),
  reportedUserEmail: z.string().optional(),
  reportedPostId: z.string().optional(),
  reportedPostTitle: z.string().optional(),
  assignedTo: z.string().optional(),
  assignedToName: z.string().optional(),
  createdAt: z.string().datetime(),
  resolvedAt: z.string().datetime().optional(),
  resolvedBy: z.string().optional(),
  resolutionNote: z.string().optional(),
});

export type AdminReport = z.infer<typeof adminReportSchema>;

export const adminReportFiltersSchema = z.object({
  search: z.string().optional(),
  type: reportTypeSchema.optional(),
  status: reportStatusSchema.optional(),
  reason: reportReasonSchema.optional(),
  assignedTo: z.string().optional(), // 'me' for current user, specific ID, or undefined for all
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  sortBy: z.enum(['createdAt', 'type', 'status']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type AdminReportFilters = z.infer<typeof adminReportFiltersSchema>;

export const adminReportsResponseSchema = z.object({
  reports: z.array(adminReportSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
  openCount: z.number(), // Count of open reports
});

export type AdminReportsResponse = z.infer<typeof adminReportsResponseSchema>;

// ============================================================================
// Admin Action Types
// ============================================================================

export interface BanUserParams {
  userId: string;
  reason: string;
}

export interface UnbanUserParams {
  userId: string;
}

export interface TakedownPostParams {
  postId: string;
  reason: string;
}

export interface RestorePostParams {
  postId: string;
}

export interface ResolveReportParams {
  reportId: string;
  note?: string;
}

export interface AssignReportParams {
  reportId: string;
  assignToMe: boolean; // true = assign to current user, false = unassign
}

export interface BulkActionParams {
  ids: string[];
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get badge variant for user status
 */
export function getUserStatusVariant(status: AdminUserStatus): 'default' | 'secondary' | 'destructive' {
  switch (status) {
    case 'active':
      return 'default';
    case 'suspended':
      return 'secondary';
    case 'banned':
      return 'destructive';
    default:
      return 'default';
  }
}

/**
 * Get badge variant for post status
 */
export function getPostStatusVariant(status: AdminPostStatus): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'published':
      return 'default';
    case 'draft':
      return 'secondary';
    case 'archived':
      return 'outline';
    case 'taken_down':
      return 'destructive';
    default:
      return 'default';
  }
}

/**
 * Get badge variant for report status
 */
export function getReportStatusVariant(status: ReportStatus): 'default' | 'secondary' | 'destructive' {
  switch (status) {
    case 'open':
      return 'destructive';
    case 'resolved':
      return 'default';
    case 'dismissed':
      return 'secondary';
    default:
      return 'default';
  }
}

/**
 * Format report reason for display
 */
export function formatReportReason(reason: ReportReason): string {
  return reason.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
}
