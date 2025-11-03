/**
 * Backend API Types - Auto-generated from NestJS DTOs
 * Source: apps/api/src/modules/admin/dto/
 */

// ============================================================================
// AUTHENTICATION
// ============================================================================

export interface RegisterDto {
  email: string;
  username: string;
  password: string;
  role?: 'USER' | 'CREATOR';
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RefreshDto {
  refreshToken: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    username: string;
    role: string;
  };
}

// ============================================================================
// DASHBOARD
// ============================================================================

export interface DashboardResponse {
  metrics: {
    users: {
      total: number;
      verified: number;
      suspended: number;
      newToday: number;
      newThisWeek: number;
      newThisMonth: number;
    };
    content: {
      totalVideos: number;
      totalPosts: number;
      pendingModeration: number;
      reportedContent: number;
    };
    financial: {
      totalRevenue: number;
      revenueThisMonth: number;
      subscriptionRevenue: number;
      ppvRevenue: number;
      tipRevenue: number;
      marketplaceRevenue: number;
      pendingPayouts: number;
    };
    reports: {
      total: number;
      pending: number;
      resolved: number;
      escalated: number;
      byPriority: {
        LOW: number;
        MEDIUM: number;
        HIGH: number;
        CRITICAL: number;
      };
    };
    kyc: {
      total: number;
      pending: number;
      approved: number;
      rejected: number;
    };
  };
  charts: {
    userGrowth: Array<{
      timestamp: string;
      value: number;
    }>;
    revenueGrowth: Array<{
      timestamp: string;
      value: number;
    }>;
    reportsTrend: Array<{
      timestamp: string;
      value: number;
    }>;
  };
  recentActivity: Array<{
    id: string;
    type: 'USER_SIGNUP' | 'CONTENT_REPORT' | 'KYC_SUBMISSION' | 'TRANSACTION';
    description: string;
    timestamp: string;
    priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  }>;
  cachedAt: string;
}

export interface DashboardMetrics {
  totalUsers: number;
  totalCreators: number;
  totalFans: number;
  totalPosts: number;
  totalRevenue: number;
  revenueThisMonth: number;
  pendingPayouts: number;
  activeSubscriptions: number;
}

// ============================================================================
// USERS
// ============================================================================

export interface AdminUserDto {
  id: string;
  username: string;
  email: string;
  displayName: string | null;
  avatar: string | null;
  role: 'USER' | 'CREATOR' | 'MODERATOR' | 'ADMIN' | 'SUPER_ADMIN';
  verified: boolean;
  suspended: boolean;
  bannedAt: string | null;
  createdAt: string;
  _count: {
    posts: number;
    followers: number;
    following: number;
  };
  totalRevenue?: number;
  lastLoginAt: string | null;
}

export interface UsersQuery {
  page?: number;
  limit?: number;
  search?: string;
  role?: 'USER' | 'CREATOR' | 'MODERATOR' | 'ADMIN' | 'SUPER_ADMIN';
  status?: 'ACTIVE' | 'SUSPENDED' | 'BANNED';
  verified?: boolean;
  sortBy?: 'createdAt' | 'username' | 'email' | 'revenue' | 'lastLoginAt';
  sortOrder?: 'asc' | 'desc';
}

export interface UsersListResponseDto {
  users: AdminUserDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UserStatsDto {
  totalUsers: number;
  totalCreators: number;
  totalFans: number;
  verifiedUsers: number;
  suspendedUsers: number;
  bannedUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
}

export interface UserDetailDto {
  user: AdminUserDto & {
    emailVerified: boolean;
    bio: string | null;
    bannedReason: string | null;
    suspendedUntil: string | null;
    kycStatus: 'NONE' | 'PENDING' | 'APPROVED' | 'REJECTED';
    subscriptionPrice: number | null;
    creatorStats?: {
      totalRevenue: number;
      totalSubscribers: number;
      totalPosts: number;
      averageEngagement: number;
    };
  };
  recentPosts: Array<{
    id: string;
    caption: string | null;
    createdAt: string;
    likesCount: number;
    commentsCount: number;
  }>;
  recentTransactions: Array<{
    id: string;
    type: string;
    amount: number;
    status: string;
    createdAt: string;
  }>;
}

export interface BanUserDto {
  reason: string;
  duration?: 'PERMANENT' | 'TEMPORARY';
  until?: string;
}

export interface SuspendUserDto {
  reason: string;
  until?: string;
}

export interface UpdateUserDto {
  email?: string;
  username?: string;
  displayName?: string;
  verified?: boolean;
  role?: 'USER' | 'CREATOR' | 'MODERATOR' | 'ADMIN';
}

export interface BulkActionDto {
  action: 'BAN' | 'SUSPEND' | 'UNSUSPEND' | 'VERIFY' | 'DELETE';
  userIds: string[];
  reason?: string;
  until?: string;
}

export interface BulkActionResponseDto {
  success: number;
  failed: number;
  errors: Array<{
    userId: string;
    error: string;
  }>;
}

// ============================================================================
// MODERATION
// ============================================================================

export interface ModerationItemDto {
  id: string;
  type: 'POST' | 'COMMENT' | 'MESSAGE' | 'PROFILE';
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  resourceId: string;
  content: string | null;
  mediaUrls: string[];
  submittedBy: {
    id: string;
    username: string;
    avatar: string | null;
  };
  assignedTo: {
    id: string;
    username: string;
  } | null;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  aiConfidence: number | null;
  aiFlags: string[];
  createdAt: string;
  reviewedAt: string | null;
}

export interface ModerationQueueQuery {
  page?: number;
  limit?: number;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
  type?: 'POST' | 'COMMENT' | 'MESSAGE' | 'PROFILE';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  assignedToMe?: boolean;
  sortBy?: 'createdAt' | 'priority';
  sortOrder?: 'asc' | 'desc';
}

export interface ModerationQueueResponseDto {
  items: ModerationItemDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ModerationStatsDto {
  pending: number;
  approved: number;
  rejected: number;
  averageReviewTime: number;
  queuedByPriority: {
    LOW: number;
    MEDIUM: number;
    HIGH: number;
    URGENT: number;
  };
}

export interface ApproveContentDto {
  note?: string;
}

export interface RejectContentDto {
  reason: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  action: 'DELETE' | 'WARN' | 'SUSPEND' | 'BAN';
}

export interface EscalateContentDto {
  reason: string;
  priority: 'HIGH' | 'URGENT';
}

export interface BulkModerationActionDto {
  action: 'APPROVE' | 'REJECT' | 'ESCALATE';
  itemIds: string[];
  reason?: string;
}

export interface BulkModerationActionResponseDto {
  success: number;
  failed: number;
  errors: Array<{
    itemId: string;
    error: string;
  }>;
}

// ============================================================================
// KYC
// ============================================================================

export type KycLevel = 'UNVERIFIED' | 'IDENTITY' | 'PAYMENT' | 'FULL';
export type KycDocumentType = 'ID_CARD' | 'PASSPORT' | 'DRIVER_LICENSE' | 'SELFIE' | 'PROOF_OF_ADDRESS';
export type KycStatus = 'NOT_STARTED' | 'PENDING' | 'UNDER_REVIEW' | 'VERIFIED' | 'REJECTED' | 'EXPIRED';

export interface KycDocument {
  id: string;
  type: KycDocumentType;
  url: string;
  status: KycStatus;
  uploadedAt: string;
  aiConfidence: number | null;
  aiAnalysis: {
    faceMatch?: number;
    documentValidity?: boolean;
    extractedData?: Record<string, unknown>;
  } | null;
}

export interface KycVerification {
  id: string;
  userId: string;
  user: {
    id: string;
    username: string;
    email: string;
    avatar: string | null;
  };
  level: KycLevel;
  status: KycStatus;
  documents: KycDocument[];
  rejectionReason: string | null;
  reviewedBy: {
    id: string;
    username: string;
  } | null;
  reviewedAt: string | null;
  submittedAt: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// TRANSACTIONS
// ============================================================================

export interface TransactionDto {
  id: string;
  type: 'SUBSCRIPTION' | 'PPV' | 'TIP' | 'PAYOUT' | 'REFUND';
  amount: number;
  currency: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  fromUser: {
    id: string;
    username: string;
  } | null;
  toUser: {
    id: string;
    username: string;
  } | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  completedAt: string | null;
}

export interface TransactionsQuery {
  page?: number;
  limit?: number;
  type?: 'SUBSCRIPTION' | 'PPV' | 'TIP' | 'PAYOUT' | 'REFUND';
  status?: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  userId?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: 'createdAt' | 'amount';
  sortOrder?: 'asc' | 'desc';
}

export interface TransactionsListResponseDto {
  transactions: TransactionDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TransactionStatsDto {
  totalVolume: number;
  totalTransactions: number;
  successRate: number;
  averageAmount: number;
  byType: {
    SUBSCRIPTION: number;
    PPV: number;
    TIP: number;
    PAYOUT: number;
    REFUND: number;
  };
}

export interface TransactionDetailDto {
  transaction: TransactionDto & {
    stripePaymentId: string | null;
    refundedAmount: number;
    refundedAt: string | null;
    failureReason: string | null;
  };
  relatedTransactions: TransactionDto[];
}

export interface RefundTransactionDto {
  reason: string;
  amount?: number;
}

export interface CancelTransactionDto {
  reason: string;
}

// ============================================================================
// AUDIT LOGS
// ============================================================================

export interface AuditLogDto {
  id: string;
  userId: string;
  user: {
    id: string;
    username: string;
    email: string;
  } | null;
  action: string;
  resource: string | null;
  metadata: Record<string, unknown> | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

export interface AuditQuery {
  page?: number;
  limit?: number;
  userId?: string;
  action?: string;
  resource?: string;
  startDate?: string;
  endDate?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface AuditListResponseDto {
  items: AuditLogDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ============================================================================
// REPORTS
// ============================================================================

export interface ReportDto {
  id: string;
  type: 'USER' | 'POST' | 'COMMENT' | 'MESSAGE';
  reason: 'SPAM' | 'HARASSMENT' | 'HATE_SPEECH' | 'VIOLENCE' | 'SEXUAL_CONTENT' | 'SCAM' | 'OTHER';
  description: string | null;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'DISMISSED';
  reportedBy: {
    id: string;
    username: string;
  };
  reportedUser: {
    id: string;
    username: string;
  } | null;
  reportedResource: {
    id: string;
    type: string;
    content: string | null;
  } | null;
  assignedTo: {
    id: string;
    username: string;
  } | null;
  createdAt: string;
  resolvedAt: string | null;
}

export interface ReportsQuery {
  page?: number;
  limit?: number;
  status?: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'DISMISSED';
  type?: 'USER' | 'POST' | 'COMMENT' | 'MESSAGE';
  assignedToMe?: boolean;
}

export interface ReportsListResponseDto {
  reports: ReportDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ============================================================================
// NEW DASHBOARD ENDPOINTS TYPES
// ============================================================================

export interface TopCreator {
  id: string;
  username: string;
  displayName: string | null;
  avatar: string | null;
  revenue: number;
  subscribers: number;
  postsCount: number;
}

export interface EngagementMetrics {
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  likesGrowth: number; // Percentage growth
  commentsGrowth: number;
  sharesGrowth: number;
}

export interface ActivityMetrics {
  activeNow: number;
  averageSessionTime: number; // In seconds
  bounceRate: number; // Percentage
}

export interface GeographyData {
  country: string;
  countryCode: string;
  revenue: number;
  percentage: number;
}

export interface ConversionFunnel {
  visitors: number;
  signups: number;
  profileCompleted: number;
  firstSubscription: number;
  activeUsers: number;
}

export interface UpcomingPayout {
  daysUntil: number;
  amount: number;
  status: 'pending' | 'released';
  estimatedDate: Date;
}

// ============================================================================
// ERROR RESPONSES
// ============================================================================

export interface ApiErrorResponse {
  statusCode: number;
  message: string | string[];
  error: string;
  timestamp: string;
  path: string;
}
