/**
 * Admin Users Types
 */

// ============================================================================
// Enums & Base Types
// ============================================================================

export type Role = 'FAN' | 'CREATOR' | 'ADMIN' | 'SUPPORT' | 'SUPER_ADMIN';

// ============================================================================
// User Filters & Query
// ============================================================================

export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'BANNED';
export type UserSortBy = 'createdAt' | 'username' | 'email' | 'revenue';
export type SortOrder = 'asc' | 'desc';

export interface UsersQuery {
  page?: number;
  limit?: number;
  search?: string;
  role?: Role;
  status?: UserStatus;
  verified?: boolean;
  sortBy?: UserSortBy;
  sortOrder?: SortOrder;
  createdFrom?: string;
  createdTo?: string;
}

// ============================================================================
// User DTOs
// ============================================================================

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  displayName: string | null;
  avatar: string | null;
  bio: string | null;
  role: Role;
  verified: boolean;
  suspended: boolean;
  bannedAt: string | null;
  bannedReason: string | null;
  createdAt: string;
  updatedAt: string;

  _count: {
    posts: number;
    followers: number;
    following: number;
  };

  totalRevenue?: number;
  pendingPayouts?: number;

  lastLoginAt: string | null;
  lastActivityAt: string | null;
}

export interface UsersListResponse {
  users: AdminUser[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UserDetail extends AdminUser {
  phoneNumber: string | null;
  dateOfBirth: string | null;

  address: string | null;
  city: string | null;
  country: string | null;
  postalCode: string | null;

  stripeCustomerId: string | null;
  stripeAccountId: string | null;

  twoFactorEnabled: boolean;
  emailVerified: boolean;

  totalSpent: number;
  totalEarned: number;
  totalPosts: number;
  totalSubscriptions: number;
  totalFollowers: number;
  totalFollowing: number;

  recentLogins: Array<{
    timestamp: string;
    ip: string;
    userAgent: string;
  }>;

  warnings: number;
  strikes: number;
  reports: number;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  bannedUsers: number;
  verifiedUsers: number;
  totalCreators: number;
  totalFans: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
}

// ============================================================================
// Update DTOs
// ============================================================================

export interface UpdateUserData {
  displayName?: string;
  bio?: string;
  role?: Role;
  verified?: boolean;
  suspended?: boolean;
  bannedReason?: string;
}

export interface BanUserData {
  reason: string;
  permanent?: boolean;
  expiresAt?: string;
  notifyUser?: boolean;
}

export interface SuspendUserData {
  reason: string;
  duration?: number; // in days
  expiresAt?: string;
  notifyUser?: boolean;
}

// ============================================================================
// Bulk Actions
// ============================================================================

export type BulkAction = 'suspend' | 'unsuspend' | 'ban' | 'unban' | 'verify' | 'unverify' | 'delete';

export interface BulkActionRequest {
  userIds: string[];
  action: BulkAction;
  reason?: string;
}

export interface BulkActionResponse {
  success: number;
  failed: number;
  errors: Array<{
    userId: string;
    error: string;
  }>;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get badge variant for user role
 */
export function getUserRoleVariant(
  role: Role
): 'default' | 'secondary' | 'outline' | 'destructive' {
  switch (role) {
    case 'ADMIN':
      return 'destructive';
    case 'CREATOR':
      return 'default';
    case 'FAN':
      return 'secondary';
    case 'SUPPORT':
      return 'outline';
    default:
      return 'secondary';
  }
}

/**
 * Get label for user role
 */
export function getUserRoleLabel(role: Role): string {
  switch (role) {
    case 'ADMIN':
      return 'Admin';
    case 'CREATOR':
      return 'Creator';
    case 'FAN':
      return 'Fan';
    case 'SUPPORT':
      return 'Support';
    default:
      return role;
  }
}

/**
 * Get badge variant for user status
 */
export function getUserStatusVariant(
  suspended: boolean,
  bannedAt: string | null
): 'default' | 'secondary' | 'destructive' {
  if (bannedAt) return 'destructive';
  if (suspended) return 'secondary';
  return 'default';
}

/**
 * Get label for user status
 */
export function getUserStatusLabel(suspended: boolean, bannedAt: string | null): string {
  if (bannedAt) return 'Banned';
  if (suspended) return 'Suspended';
  return 'Active';
}

/**
 * Format user status for display
 */
export function formatUserStatus(suspended: boolean, bannedAt: string | null): UserStatus {
  if (bannedAt) return 'BANNED';
  if (suspended) return 'SUSPENDED';
  return 'ACTIVE';
}

/**
 * Get initials from name for avatar fallback
 */
export function getUserInitials(name: string | null, username: string): string {
  if (name) {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }
  return username.slice(0, 2).toUpperCase();
}

/**
 * Format currency value
 */
export function formatCurrency(amount: number, currency: string = 'EUR'): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency,
  }).format(amount);
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
 * Get label for bulk action
 */
export function getBulkActionLabel(action: BulkAction): string {
  switch (action) {
    case 'suspend':
      return 'Suspend Users';
    case 'unsuspend':
      return 'Unsuspend Users';
    case 'ban':
      return 'Ban Users';
    case 'unban':
      return 'Unban Users';
    case 'verify':
      return 'Verify Users';
    case 'unverify':
      return 'Unverify Users';
    case 'delete':
      return 'Delete Users';
    default:
      return action;
  }
}

/**
 * Get description for bulk action
 */
export function getBulkActionDescription(action: BulkAction, count: number): string {
  const users = count === 1 ? 'user' : 'users';
  switch (action) {
    case 'suspend':
      return `Suspend ${count} ${users}`;
    case 'unsuspend':
      return `Unsuspend ${count} ${users}`;
    case 'ban':
      return `Ban ${count} ${users}`;
    case 'unban':
      return `Unban ${count} ${users}`;
    case 'verify':
      return `Verify ${count} ${users}`;
    case 'unverify':
      return `Unverify ${count} ${users}`;
    case 'delete':
      return `Delete ${count} ${users}`;
    default:
      return `Perform action on ${count} ${users}`;
  }
}
