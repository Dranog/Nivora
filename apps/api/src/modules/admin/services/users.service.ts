import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { AuditLogService } from '../../audit/audit-log.service'; // ✅ Changé de AuditService
import { Role, Prisma } from '@prisma/client';
import type {
  UsersQuery,
  UsersListResponseDto,
  AdminUserDto,
  UserDetailDto,
  UpdateUserDto,
  BulkActionDto,
  BulkActionResponseDto,
  UserStatsDto,
  BanUserDto,
  SuspendUserDto,
} from '../dto/users.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditLogService // ✅ Changé de AuditService
  ) {}

  /**
   * Get paginated list of users with filters
   */
  async getUsers(query: UsersQuery): Promise<UsersListResponseDto> {
    const { page, limit, search, role, status, verified, sortBy, sortOrder, createdFrom, createdTo } =
      query;

    // Build where clause
    const where: Prisma.UserWhereInput = {};

    // Search filter (username, email, displayName)
    if (search) {
      where.OR = [
        { username: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { displayName: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Role filter
    if (role) {
      where.role = role as Role;
    }

    // Status filter
    if (status === 'ACTIVE') {
      where.suspended = false;
      where.status = 'ACTIVE';
    } else if (status === 'SUSPENDED') {
      where.suspended = true;
    } else if (status === 'BANNED') {
      // Note: bannedAt field removed - using bannedReason check
      where.bannedReason = { not: null };
    }

    // Verified filter
    if (verified !== undefined) {
      where.verified = verified;
    }

    // Date range filter
    if (createdFrom || createdTo) {
      where.createdAt = {};
      if (createdFrom) {
        where.createdAt.gte = new Date(createdFrom);
      }
      if (createdTo) {
        where.createdAt.lte = new Date(createdTo);
      }
    }

    // Count total
    const total = await this.prisma.user.count({ where });

    // Calculate pagination
    const skip = (page - 1) * limit;
    const totalPages = Math.ceil(total / limit);

    // Build orderBy
    let orderBy: Prisma.UserOrderByWithRelationInput = { [sortBy]: sortOrder };

    // For revenue sorting, we need a more complex query
    if (sortBy === 'revenue') {
      // This is a simplified approach; for production, you'd want to join with ledger entries
      orderBy = { createdAt: sortOrder }; // fallback to createdAt
    }

    // Fetch users
    const users = await this.prisma.user.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        _count: {
          select: {
            posts: true,
            // following: true, // Field removed from schema
          },
        },
      },
    });

    // Calculate revenue for each user (creators only)
    const usersWithRevenue = await Promise.all(
      users.map(async (user) => {
        let totalRevenue = 0;
        let pendingPayouts = 0;

        if (user.role === Role.CREATOR) {
          try {
            // Calculate total revenue from ledger
            const revenueResult = await this.prisma.ledgerEntry.aggregate({
              where: {
                userId: user.id,
                // type: { in: ['SUBSCRIPTION', 'PPV_PURCHASE', 'TIP'] }, // Field removed from LedgerEntry
              },
              _sum: {
                amount: true,
              },
            }).catch(() => ({ _sum: { amount: 0 } }));
            totalRevenue = ((revenueResult._sum?.amount || 0)) / 100;

            // Calculate pending payouts
            const pendingResult = await this.prisma.payout.aggregate({
              where: {
                creatorId: user.id,
                status: 'PENDING',
              },
              _sum: {
                amount: true,
              },
            }).catch(() => ({ _sum: { amount: 0 } }));
            pendingPayouts = (pendingResult._sum?.amount || 0) / 100;
          } catch (error) {
            // Tables don't exist yet - use default values
            console.warn(`Revenue calculation failed for user ${user.id}: ${error instanceof Error ? error.message : String(error)}`);
            totalRevenue = 0;
            pendingPayouts = 0;
          }
        }

        return {
          id: user.id,
          username: user.username,
          email: user.email,
          displayName: user.displayName,
          avatar: user.avatar,
          bio: user.bio,
          role: user.role,
          verified: user.emailVerified,
          suspended: user.status === 'SUSPENDED',
          bannedReason: user.bannedReason,
          bannedAt: null, // Field removed from User model
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString(),
          _count: { posts: 0, followers: 0, following: 0 },
          // _count removed followers field
          totalRevenue: user.role === Role.CREATOR ? totalRevenue : undefined,
          pendingPayouts: user.role === Role.CREATOR ? pendingPayouts : undefined,
          lastLoginAt: user.lastLoginAt?.toISOString() || null,
          lastActivityAt: user.lastActivityAt?.toISOString() || null,
        } as AdminUserDto;
      })
    );

    return {
      users: usersWithRevenue,
      total,
      page,
      limit,
      totalPages,
    };
  }

  /**
   * Get user statistics
   */
  async getUserStats(): Promise<UserStatsDto> {
    const now = new Date();
    const todayStart = new Date(now.setHours(0, 0, 0, 0));
    const weekStart = new Date(now.setDate(now.getDate() - 7));
    const monthStart = new Date(now.setMonth(now.getMonth() - 1));

    const [
      totalUsers,
      activeUsers,
      suspendedUsers,
      bannedUsers,
      verifiedUsers,
      totalCreators,
      totalFans,
      newUsersToday,
      newUsersThisWeek,
      newUsersThisMonth,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count(),
      this.prisma.user.count({ where: { status: 'SUSPENDED' } }),
      this.prisma.user.count({ where: { bannedReason: { not: null } } }), // bannedUsers
      this.prisma.user.count({ where: { emailVerified: true } }),
      this.prisma.user.count({ where: { role: Role.CREATOR } }),
      this.prisma.user.count({ where: { role: Role.FAN } }),
      this.prisma.user.count({ where: { createdAt: { gte: todayStart } } }),
      this.prisma.user.count({ where: { createdAt: { gte: weekStart } } }),
      this.prisma.user.count({ where: { createdAt: { gte: monthStart } } }),
    ]);

    return {
      totalUsers,
      activeUsers,
      suspendedUsers,
      bannedUsers,
      verifiedUsers,
      totalCreators,
      totalFans,
      newUsersToday,
      newUsersThisWeek,
      newUsersThisMonth,
    };
  }

  /**
   * Get user detail by ID
   */
  async getUserDetail(userId: string, adminId: string): Promise<UserDetailDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      // _count removed - relation fields don't exist
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Calculate financial stats (with fallback for missing tables)
    let totalSpent = 0;
    let totalEarned = 0;
    let reports = 0;

    try {
      const [spentResult, earnedResult, reportsCount] = await Promise.all([
        this.prisma.ledgerEntry.aggregate({
          where: {
            userId: user.id,
            // type: { in: ['SUBSCRIPTION', 'PPV_PURCHASE', 'TIP'] }, // Field removed from LedgerEntry
          },
          _sum: { amount: true },
        }).catch(() => ({ _sum: { amount: 0 } })),
        this.prisma.ledgerEntry.aggregate({
          where: {
            userId: user.id,
            // type: 'CREATOR_REVENUE', // Field removed from LedgerEntry
          },
          _sum: { amount: true },
        }).catch(() => ({ _sum: { amount: 0 } })),
        this.prisma.$queryRaw<[{ count: bigint }]>`
          SELECT COUNT(*) as count FROM "Report" WHERE "targetUserId" = ${user.id}
        `.catch(() => [{ count: BigInt(0) }]),
      ]);

      totalSpent = (spentResult._sum?.amount || 0) / 100;
      totalEarned = (earnedResult._sum?.amount || 0) / 100;
      reports = Number(reportsCount[0]?.count || 0);
    } catch (error) {
      // Tables don't exist yet - use default values
      console.warn(`Financial stats query failed: ${error instanceof Error ? error.message : String(error)}`);
    }

    // Get recent logins (from audit log)
    const recentLogins = await this.prisma.auditLog.findMany({
      where: {
        userId: user.id,
        event: 'USER_LOGIN',
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        createdAt: true,
        meta: true,
      },
    });

    // Audit this access
    await this.audit.log({
      userId: adminId,
      event: 'ADMIN_VIEW_USER_DETAIL',
      resource: 'USER',
      meta: { viewedUserId: userId },
    });

    return {
      // Basic info
      id: user.id,
      username: user.username,
      email: user.email,
      displayName: user.displayName,
      avatar: user.avatar,
      bio: user.bio,
      role: user.role as any,
      verified: user.emailVerified ?? false,
      suspended: user.status === 'SUSPENDED',
      bannedReason: user.bannedReason,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      bannedAt: null, // Field removed from User model
      _count: { posts: 0, followers: 0, following: 0 },

      // Contact info
      phoneNumber: null, // Add to User model if needed
      dateOfBirth: null, // Add to User model if needed

      // Address
      address: null,
      city: null,
      country: null,
      postalCode: null,

      // Payment info
      stripeCustomerId: user.stripeCustomerId,
      stripeAccountId: user.stripeAccountId,

      // Security
      twoFactorEnabled: user.twoFactorEnabled ?? false,
      emailVerified: user.emailVerified ?? false,

      // Activity summary
      totalSpent,
      totalEarned,
      // Note: _count not included in query due to followers issue
      totalPosts: 0,
      totalSubscriptions: 0,
      totalFollowers: 0,
      totalFollowing: 0,

      // Recent logins
      recentLogins: recentLogins.map((log) => ({
        timestamp: log.createdAt.toISOString(),
        ip: (log.meta as any)?.ip || 'Unknown',
        userAgent: (log.meta as any)?.userAgent || 'Unknown',
      })),

      // Moderation
      warnings: 0, // Add to User model if needed
      strikes: 0, // Add to User model if needed
      reports,

      lastLoginAt: user.lastLoginAt?.toISOString() || null,
      lastActivityAt: user.lastActivityAt?.toISOString() || null,
    };
  }

  /**
   * Update user
   */
  async updateUser(
    userId: string,
    data: UpdateUserDto,
    adminId: string
  ): Promise<AdminUserDto> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Update user
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        displayName: data.displayName,
        bio: data.bio,
        role: data.role as Role,
        emailVerified: data.verified,
        suspended: data.suspended,
        bannedReason: data.bannedReason,
        updatedAt: new Date(),
      },
      include: {
        _count: {
          select: {
            posts: true,
            // following: true, // Field removed from schema
          },
        },
      },
    });

    // Audit log
    await this.audit.log({
      userId: adminId,
      event: 'ADMIN_UPDATE_USER',
      resource: 'USER',
      meta: { changes: data },
    });

    return {
      id: updated.id,
      username: updated.username,
      email: updated.email,
      displayName: updated.displayName,
      avatar: updated.avatar,
      bio: updated.bio,
      role: updated.role as any,
      verified: updated.emailVerified ?? false,
      suspended: updated.status === 'SUSPENDED',
      bannedReason: updated.bannedReason,
      bannedAt: null, // Field removed from User model
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
      _count: { posts: 0, followers: 0, following: 0 },
      lastLoginAt: updated.lastLoginAt?.toISOString() || null,
      lastActivityAt: updated.lastActivityAt?.toISOString() || null,
    };
  }

  /**
   * Ban user
   */
  async banUser(userId: string, data: BanUserDto, adminId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        bannedReason: data.reason,
        status: 'SUSPENDED',
      },
    });

    // Audit log
    await this.audit.log({
      userId: adminId,
      event: 'ADMIN_BAN_USER',
      resource: 'USER',
      meta: { reason: data.reason, permanent: data.permanent },
    });

    // TODO: Send notification email if data.notifyUser is true
  }

  /**
   * Unban user
   */
  async unbanUser(userId: string, adminId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        bannedReason: null,
        status: 'ACTIVE',
      },
    });

    await this.audit.log({
      userId: adminId,
      event: 'ADMIN_UNBAN_USER',
      resource: 'USER',
    });
  }

  /**
   * Suspend user
   */
  async suspendUser(userId: string, data: SuspendUserDto, adminId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        status: 'SUSPENDED',
      },
    });

    await this.audit.log({
      userId: adminId,
      event: 'ADMIN_SUSPEND_USER',
      resource: 'USER',
      meta: { reason: data.reason, duration: data.duration },
    });

    // TODO: Schedule unsuspend if duration is provided
  }

  /**
   * Unsuspend user
   */
  async unsuspendUser(userId: string, adminId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        status: 'ACTIVE',
      },
    });

    await this.audit.log({
      userId: adminId,
      event: 'ADMIN_UNSUSPEND_USER',
      resource: 'USER',
    });
  }

  /**
   * Restore user (remove suspension and ban)
   * Migrated from admin.service.ts
   */
  async restoreUser(userId: string, adminId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        status: 'ACTIVE',
        bannedReason: null,
        suspended: false,
      },
    });

    await this.audit.log({
      userId: adminId,
      event: 'ADMIN_RESTORE_USER',
      resource: 'USER',
    });
  }

  /**
   * Bulk action on users
   */
  async bulkAction(data: BulkActionDto, adminId: string): Promise<BulkActionResponseDto> {
    const { userIds, action, reason } = data;
    const results = {
      success: 0,
      failed: 0,
      errors: [] as Array<{ userId: string; error: string }>,
    };

    for (const userId of userIds) {
      try {
        switch (action) {
          case 'suspend':
            await this.suspendUser(userId, { reason: reason || 'Bulk action', notifyUser: false }, adminId);
            break;
          case 'unsuspend':
            await this.unsuspendUser(userId, adminId);
            break;
          case 'ban':
            await this.banUser(userId, { reason: reason || 'Bulk action', permanent: true, notifyUser: false }, adminId);
            break;
          case 'unban':
            await this.unbanUser(userId, adminId);
            break;
          case 'verify':
            await this.prisma.user.update({ where: { id: userId }, data: { emailVerified: true } });
            break;
          case 'unverify':
            await this.prisma.user.update({ where: { id: userId }, data: { emailVerified: false } });
            break;
          case 'delete':
            // Soft delete or hard delete based on requirements
            throw new BadRequestException('Delete action not implemented yet');
          default:
            throw new BadRequestException(`Unknown event: ${action}`);
        }
        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          userId,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    // Audit bulk action
    await this.audit.log({
      userId: adminId,
      event: 'ADMIN_BULK_ACTION_USERS',
      resource: 'USER',
      meta: {
        action,
        userIds,
        results,
      },
    });

    return results;
  }
}
