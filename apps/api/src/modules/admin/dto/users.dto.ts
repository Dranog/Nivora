import { z } from 'zod';
import { UserRole as Role } from '@prisma/client';

// ============================================================================
// Query & Filter Schemas
// ============================================================================

export const usersQuerySchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  role: z.nativeEnum(Role).optional(),
  status: z.enum(['ACTIVE', 'SUSPENDED', 'BANNED']).optional(),
  verified: z.boolean().optional(),
  sortBy: z.enum(['createdAt', 'username', 'email', 'revenue']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  createdFrom: z.string().datetime().optional(),
  createdTo: z.string().datetime().optional(),
});

export type UsersQuery = z.infer<typeof usersQuerySchema>;

// ============================================================================
// User Response DTOs
// ============================================================================

export const adminUserSchema = z.object({
  id: z.string(),
  username: z.string(),
  email: z.string().email(),
  displayName: z.string().nullable(),
  avatar: z.string().nullable(),
  bio: z.string().nullable(),
  role: z.nativeEnum(Role),
  verified: z.boolean(),
  suspended: z.boolean(),
  bannedAt: z.string().datetime().nullable(),
  bannedReason: z.string().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),

  // Stats
  _count: z.object({
    posts: z.number(),
    followers: z.number(),
    following: z.number(),
  }),

  // Revenue (for creators)
  totalRevenue: z.number().optional(),
  pendingPayouts: z.number().optional(),

  // Last activity
  lastLoginAt: z.string().datetime().nullable(),
  lastActivityAt: z.string().datetime().nullable(),
});

export type AdminUserDto = z.infer<typeof adminUserSchema>;

export const usersListResponseSchema = z.object({
  users: z.array(adminUserSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
});

export type UsersListResponseDto = z.infer<typeof usersListResponseSchema>;

// ============================================================================
// User Update DTOs
// ============================================================================

export const updateUserSchema = z.object({
  displayName: z.string().min(1).max(100).optional(),
  bio: z.string().max(500).optional(),
  role: z.nativeEnum(Role).optional(),
  verified: z.boolean().optional(),
  suspended: z.boolean().optional(),
  bannedReason: z.string().max(1000).optional(),
});

export type UpdateUserDto = z.infer<typeof updateUserSchema>;

// ============================================================================
// Bulk Actions DTOs
// ============================================================================

export const bulkActionSchema = z.object({
  userIds: z.array(z.string()).min(1).max(100),
  action: z.enum(['suspend', 'unsuspend', 'ban', 'unban', 'verify', 'unverify', 'delete']),
  reason: z.string().max(1000).optional(),
});

export type BulkActionDto = z.infer<typeof bulkActionSchema>;

export const bulkActionResponseSchema = z.object({
  success: z.number().int().nonnegative(),
  failed: z.number().int().nonnegative(),
  errors: z.array(
    z.object({
      userId: z.string(),
      error: z.string(),
    })
  ),
});

export type BulkActionResponseDto = z.infer<typeof bulkActionResponseSchema>;

// ============================================================================
// User Stats DTO
// ============================================================================

export const userStatsSchema = z.object({
  totalUsers: z.number().int().nonnegative(),
  activeUsers: z.number().int().nonnegative(),
  suspendedUsers: z.number().int().nonnegative(),
  bannedUsers: z.number().int().nonnegative(),
  verifiedUsers: z.number().int().nonnegative(),
  totalCreators: z.number().int().nonnegative(),
  totalFans: z.number().int().nonnegative(),
  newUsersToday: z.number().int().nonnegative(),
  newUsersThisWeek: z.number().int().nonnegative(),
  newUsersThisMonth: z.number().int().nonnegative(),
});

export type UserStatsDto = z.infer<typeof userStatsSchema>;

// ============================================================================
// User Detail DTO (Extended)
// ============================================================================

export const userDetailSchema = adminUserSchema.extend({
  // Contact info
  phoneNumber: z.string().nullable(),
  dateOfBirth: z.string().datetime().nullable(),

  // Address (if provided for KYC)
  address: z.string().nullable(),
  city: z.string().nullable(),
  country: z.string().nullable(),
  postalCode: z.string().nullable(),

  // Payment info
  stripeCustomerId: z.string().nullable(),
  stripeAccountId: z.string().nullable(),

  // Security
  twoFactorEnabled: z.boolean(),
  emailVerified: z.boolean(),

  // Activity summary
  totalSpent: z.number(),
  totalEarned: z.number(),
  totalPosts: z.number(),
  totalSubscriptions: z.number(),
  totalFollowers: z.number(),
  totalFollowing: z.number(),

  // Recent activity
  recentLogins: z.array(
    z.object({
      timestamp: z.string().datetime(),
      ip: z.string(),
      userAgent: z.string(),
    })
  ).max(10),

  // Moderation history
  warnings: z.number().int().nonnegative(),
  strikes: z.number().int().nonnegative(),
  reports: z.number().int().nonnegative(),
});

export type UserDetailDto = z.infer<typeof userDetailSchema>;

// ============================================================================
// Ban/Suspend DTOs
// ============================================================================

export const banUserSchema = z.object({
  reason: z.string().min(10).max(1000),
  permanent: z.boolean().default(true),
  expiresAt: z.string().datetime().optional(),
  notifyUser: z.boolean().default(true),
});

export type BanUserDto = z.infer<typeof banUserSchema>;

export const suspendUserSchema = z.object({
  reason: z.string().min(10).max(1000),
  duration: z.number().int().positive().optional(), // in days
  expiresAt: z.string().datetime().optional(),
  notifyUser: z.boolean().default(true),
});

export type SuspendUserDto = z.infer<typeof suspendUserSchema>;
