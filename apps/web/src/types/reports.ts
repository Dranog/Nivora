/**
 * Admin Reports Types
 */

// ============================================================================
// Enums
// ============================================================================

export enum ReportType {
  USER = 'USER',
  POST = 'POST',
  COMMENT = 'COMMENT',
  MESSAGE = 'MESSAGE',
}

export enum ReportSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum ReportStatus {
  PENDING = 'PENDING',
  IN_REVIEW = 'IN_REVIEW',
  RESOLVED = 'RESOLVED',
  DISMISSED = 'DISMISSED',
}

export type ReportSortBy = 'createdAt' | 'severity' | 'status';
export type SortOrder = 'asc' | 'desc';

// ============================================================================
// Query Types
// ============================================================================

export interface ReportsQuery {
  page?: number;
  limit?: number;
  search?: string;
  type?: ReportType;
  severity?: ReportSeverity;
  status?: ReportStatus;
  assignedToId?: string;
  sortBy?: ReportSortBy;
  sortOrder?: SortOrder;
  createdFrom?: string;
  createdTo?: string;
}

// ============================================================================
// Report DTOs
// ============================================================================

export interface ReportUser {
  id: string;
  username: string;
  email: string;
  avatar?: string | null;
}

export interface Report {
  id: string;
  reporterId: string;
  reporter: ReportUser;
  targetType: ReportType;
  targetId: string;
  targetUserId: string | null;
  targetUser: ReportUser | null;
  severity: ReportSeverity;
  status: ReportStatus;
  reason: string;
  description: string | null;
  assignedToId: string | null;
  assignedTo: Omit<ReportUser, 'avatar'> | null;
  reviewedById: string | null;
  reviewedBy: Omit<ReportUser, 'avatar'> | null;
  resolution: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ReportsListResponse {
  reports: Report[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ReportStats {
  totalReports: number;
  pendingReports: number;
  inReviewReports: number;
  resolvedReports: number;
  dismissedReports: number;
  criticalReports: number;
  highSeverityReports: number;
  newReportsToday: number;
  newReportsThisWeek: number;
  averageResolutionTime: number; // in hours
}

export interface ModerationHistoryItem {
  id: string;
  action: string;
  performedBy: {
    id: string;
    username: string;
  };
  timestamp: string;
  notes: string | null;
}

export interface RelatedReport {
  id: string;
  reason: string;
  status: ReportStatus;
  createdAt: string;
}

export interface ReportDetail extends Report {
  targetContent: any | null;
  moderationHistory: ModerationHistoryItem[];
  relatedReports: RelatedReport[];
}

// ============================================================================
// Action DTOs
// ============================================================================

export interface ResolveReportData {
  resolution: string;
  action: 'NO_ACTION' | 'WARNING_SENT' | 'CONTENT_REMOVED' | 'USER_SUSPENDED' | 'USER_BANNED';
  notifyReporter?: boolean;
}

export interface DismissReportData {
  reason: string;
  notifyReporter?: boolean;
}

export interface AssignReportData {
  assignedToId: string;
}

export interface UpdateReportData {
  status?: ReportStatus;
  severity?: ReportSeverity;
  assignedToId?: string | null;
  resolution?: string;
}

// ============================================================================
// Bulk Actions
// ============================================================================

export type BulkReportAction = 'assign' | 'dismiss' | 'mark_in_review';

export interface BulkReportActionRequest {
  reportIds: string[];
  action: BulkReportAction;
  assignedToId?: string;
  reason?: string;
}

export interface BulkReportActionResponse {
  success: number;
  failed: number;
  errors: Array<{
    reportId: string;
    error: string;
  }>;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get badge variant for report type
 */
export function getReportTypeVariant(
  type: ReportType
): 'default' | 'secondary' | 'outline' | 'destructive' {
  switch (type) {
    case ReportType.USER:
      return 'destructive';
    case ReportType.POST:
      return 'default';
    case ReportType.COMMENT:
      return 'secondary';
    case ReportType.MESSAGE:
      return 'outline';
    default:
      return 'default';
  }
}

/**
 * Get label for report type
 */
export function getReportTypeLabel(type: ReportType): string {
  switch (type) {
    case ReportType.USER:
      return 'User';
    case ReportType.POST:
      return 'Post';
    case ReportType.COMMENT:
      return 'Comment';
    case ReportType.MESSAGE:
      return 'Message';
    default:
      return type;
  }
}

/**
 * Get badge variant for report severity
 */
export function getReportSeverityVariant(
  severity: ReportSeverity
): 'default' | 'secondary' | 'outline' | 'destructive' {
  switch (severity) {
    case ReportSeverity.CRITICAL:
      return 'destructive';
    case ReportSeverity.HIGH:
      return 'destructive';
    case ReportSeverity.MEDIUM:
      return 'default';
    case ReportSeverity.LOW:
      return 'secondary';
    default:
      return 'default';
  }
}

/**
 * Get label for report severity
 */
export function getReportSeverityLabel(severity: ReportSeverity): string {
  switch (severity) {
    case ReportSeverity.CRITICAL:
      return 'Critical';
    case ReportSeverity.HIGH:
      return 'High';
    case ReportSeverity.MEDIUM:
      return 'Medium';
    case ReportSeverity.LOW:
      return 'Low';
    default:
      return severity;
  }
}

/**
 * Get color class for severity
 */
export function getReportSeverityColor(severity: ReportSeverity): string {
  switch (severity) {
    case ReportSeverity.CRITICAL:
      return 'text-red-600 bg-red-50';
    case ReportSeverity.HIGH:
      return 'text-orange-600 bg-orange-50';
    case ReportSeverity.MEDIUM:
      return 'text-yellow-600 bg-yellow-50';
    case ReportSeverity.LOW:
      return 'text-blue-600 bg-blue-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
}

/**
 * Get badge variant for report status
 */
export function getReportStatusVariant(
  status: ReportStatus
): 'default' | 'secondary' | 'outline' | 'destructive' {
  switch (status) {
    case ReportStatus.PENDING:
      return 'default';
    case ReportStatus.IN_REVIEW:
      return 'secondary';
    case ReportStatus.RESOLVED:
      return 'outline';
    case ReportStatus.DISMISSED:
      return 'outline';
    default:
      return 'default';
  }
}

/**
 * Get label for report status
 */
export function getReportStatusLabel(status: ReportStatus): string {
  switch (status) {
    case ReportStatus.PENDING:
      return 'Pending';
    case ReportStatus.IN_REVIEW:
      return 'In Review';
    case ReportStatus.RESOLVED:
      return 'Resolved';
    case ReportStatus.DISMISSED:
      return 'Dismissed';
    default:
      return status;
  }
}

/**
 * Get color class for status
 */
export function getReportStatusColor(status: ReportStatus): string {
  switch (status) {
    case ReportStatus.PENDING:
      return 'text-yellow-600 bg-yellow-50';
    case ReportStatus.IN_REVIEW:
      return 'text-blue-600 bg-blue-50';
    case ReportStatus.RESOLVED:
      return 'text-green-600 bg-green-50';
    case ReportStatus.DISMISSED:
      return 'text-gray-600 bg-gray-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
}

/**
 * Format date for display
 */
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('fr-FR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(d);
}

/**
 * Format date and time for display
 */
export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('fr-FR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

/**
 * Format time ago
 */
export function formatTimeAgo(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diff = now.getTime() - d.getTime();

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

  return formatDate(d);
}

/**
 * Get initials from name
 */
export function getUserInitials(username: string): string {
  return username.slice(0, 2).toUpperCase();
}
