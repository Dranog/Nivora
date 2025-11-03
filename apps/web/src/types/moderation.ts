// Moderation Queue Types for Oliver Platform Admin

// ============================================================================
// Enums
// ============================================================================

export enum ModerationPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export enum ModerationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  ESCALATED = 'ESCALATED',
}

export enum ModerationContentType {
  POST = 'POST',
  COMMENT = 'COMMENT',
  USER = 'USER',
  MESSAGE = 'MESSAGE',
}

// ============================================================================
// Query & Filter Types
// ============================================================================

export interface ModerationQueueQuery {
  page?: number;
  limit?: number;
  search?: string;
  priority?: ModerationPriority;
  status?: ModerationStatus;
  assignedToId?: string;
  contentType?: ModerationContentType;
  sortBy?: 'createdAt' | 'priority' | 'status';
  sortOrder?: 'asc' | 'desc';
}

// ============================================================================
// Moderation Decision Types
// ============================================================================

export interface ModerationUser {
  id: string;
  username: string;
  email: string;
}

export interface ModerationDecision {
  id: string;
  contentType: ModerationContentType;
  contentId: string;
  priority: ModerationPriority;
  status: ModerationStatus;
  assignedToId: string | null;
  assignedTo: ModerationUser | null;
  reviewedById: string | null;
  reviewedBy: ModerationUser | null;
  decision: string | null;
  notes: string | null;
  aiConfidence: number | null;
  aiFlags: string[];
  createdAt: string;
  updatedAt: string;
  contentPreview: any;
}

export interface ModerationQueueResponse {
  items: ModerationDecision[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ============================================================================
// Stats Types
// ============================================================================

export interface ModerationStats {
  totalItems: number;
  pendingItems: number;
  approvedItems: number;
  rejectedItems: number;
  escalatedItems: number;
  urgentItems: number;
  highPriorityItems: number;
  newItemsToday: number;
  newItemsThisWeek: number;
  averageReviewTime: number; // in minutes
}

// ============================================================================
// Action Types
// ============================================================================

export interface ApproveContentRequest {
  notes?: string;
}

export interface RejectContentRequest {
  reason: string;
  action: 'DELETE_CONTENT' | 'SUSPEND_USER' | 'BAN_USER' | 'WARNING';
  notifyUser: boolean;
}

export interface EscalateContentRequest {
  reason: string;
  escalateTo: string;
}

export interface BulkModerationActionRequest {
  itemIds: string[];
  action: 'approve' | 'reject' | 'assign' | 'escalate';
  assignedToId?: string;
  reason?: string;
}

export interface BulkModerationActionResponse {
  success: number;
  failed: number;
  errors: Array<{ itemId: string; error: string }>;
}

// ============================================================================
// Helper Functions
// ============================================================================

export function getModerationPriorityLabel(priority: ModerationPriority): string {
  switch (priority) {
    case ModerationPriority.LOW:
      return 'Low';
    case ModerationPriority.MEDIUM:
      return 'Medium';
    case ModerationPriority.HIGH:
      return 'High';
    case ModerationPriority.URGENT:
      return 'Urgent';
  }
}

export function getModerationPriorityColor(priority: ModerationPriority): string {
  switch (priority) {
    case ModerationPriority.LOW:
      return 'text-gray-600 bg-gray-50 border-gray-200';
    case ModerationPriority.MEDIUM:
      return 'text-blue-600 bg-blue-50 border-blue-200';
    case ModerationPriority.HIGH:
      return 'text-orange-600 bg-orange-50 border-orange-200';
    case ModerationPriority.URGENT:
      return 'text-red-600 bg-red-50 border-red-200';
  }
}

export function getModerationStatusLabel(status: ModerationStatus): string {
  switch (status) {
    case ModerationStatus.PENDING:
      return 'Pending';
    case ModerationStatus.APPROVED:
      return 'Approved';
    case ModerationStatus.REJECTED:
      return 'Rejected';
    case ModerationStatus.ESCALATED:
      return 'Escalated';
  }
}

export function getModerationStatusColor(status: ModerationStatus): string {
  switch (status) {
    case ModerationStatus.PENDING:
      return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case ModerationStatus.APPROVED:
      return 'text-green-600 bg-green-50 border-green-200';
    case ModerationStatus.REJECTED:
      return 'text-red-600 bg-red-50 border-red-200';
    case ModerationStatus.ESCALATED:
      return 'text-purple-600 bg-purple-50 border-purple-200';
  }
}

export function getContentTypeLabel(type: ModerationContentType): string {
  switch (type) {
    case ModerationContentType.POST:
      return 'Post';
    case ModerationContentType.COMMENT:
      return 'Comment';
    case ModerationContentType.USER:
      return 'User';
    case ModerationContentType.MESSAGE:
      return 'Message';
  }
}

export function getContentTypeVariant(type: ModerationContentType): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (type) {
    case ModerationContentType.POST:
      return 'default';
    case ModerationContentType.COMMENT:
      return 'secondary';
    case ModerationContentType.USER:
      return 'outline';
    case ModerationContentType.MESSAGE:
      return 'destructive';
  }
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('fr-FR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(d);
}

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

export function formatTimeAgo(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const diff = new Date().getTime() - d.getTime();

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

  return formatDate(d);
}

export function getUserInitials(username: string): string {
  if (!username) return '?';
  const parts = username.split(/[\s_-]+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return username.slice(0, 2).toUpperCase();
}

export function formatAIConfidence(confidence: number | null): string {
  if (confidence === null) return 'N/A';
  return `${Math.round(confidence * 100)}%`;
}

export function getAIConfidenceColor(confidence: number | null): string {
  if (confidence === null) return 'text-gray-600';
  if (confidence >= 0.9) return 'text-green-600';
  if (confidence >= 0.7) return 'text-yellow-600';
  return 'text-red-600';
}
