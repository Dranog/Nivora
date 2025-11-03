import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
// import { ModerationService } from './services/moderation.service'; // TEMPORARILY DISABLED
import { UsersService } from './services/users.service';
import * as bcrypt from 'bcrypt';
import type { UpdateAdminProfileDto, UpdateAdminPreferencesDto } from './dto';
import * as crypto from 'crypto';

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    // private moderation: ModerationService, // TEMPORARILY DISABLED
    private usersService: UsersService,
  ) {}

  async getFlags(
    filters: { status?: string; type?: string },
    pagination: { limit: number; offset: number },
  ) {
    // Assuming you have a Flag model or use Ticket with type=FLAG
    const where: any = {};
    if (filters.status) where.status = filters.status;

    const [flags, total] = await Promise.all([
      this.prisma.ticket.findMany({
        where,
        skip: pagination.offset,
        take: pagination.limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { email: true },
          },
        },
      }),
      this.prisma.ticket.count({ where }),
    ]);

    return { flags, total };
  }

  async resolveFlag(
    flagId: string,
    adminId: string,
    event: 'APPROVE' | 'REMOVE_CONTENT' | 'BAN_USER',
    notes?: string,
  ) {
    const flag = await this.prisma.ticket.findUnique({
      where: { id: flagId },
    });

    if (!flag) throw new NotFoundException('Flag not found');

    // Execute action
    if (event === 'BAN_USER') {
      await this.usersService.banUser(
        flag.userId,
        { reason: `Flagged content: ${flag.subject}`, permanent: true, notifyUser: false },
        adminId
      );
    } else if (event === 'REMOVE_CONTENT') {
      // Archive related content
      // TODO: Extract postId from flag.meta
    }

    // Update flag
    await this.prisma.ticket.update({
      where: { id: flagId },
      data: {
        status: 'RESOLVED',
        updatedAt: new Date(),
      },
    });

    // Log
    await this.prisma.auditLog.create({
      data: {
          id: crypto.randomUUID(),
        userId: adminId,
        event: 'FLAG_RESOLVED',
        resource: 'Ticket',
        meta: { flagId, action: event, notes },
      },
    });

    return { success: true };
  }

  async getPlatformStats() {
    const [
      totalUsers,
      totalCreators,
      totalRevenue,
      activeSubs,
      postsCount,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.creatorProfile.count(),
      this.prisma.ledgerEntry.aggregate({
        where: {
          // type: { in: ['SUBSCRIPTION', 'PPV_PURCHASE', 'TIP'] }, // Field does not exist in LedgerEntry schema
        },
        _sum: { amount: true },
      }),
      this.prisma.subscription.count({ where: { status: 'ACTIVE' } }),
      this.prisma.post.count({ where: { /* deletedAt: null */ } }), // deletedAt field does not exist in Post schema
    ]);

    return {
      users: {
        total: totalUsers,
        creators: totalCreators,
        fans: totalUsers - totalCreators,
      },
      revenue: {
        total: (totalRevenue._sum?.amount || 0) / 100,
        currency: 'EUR',
      },
      subscriptions: {
        active: activeSubs,
      },
      content: {
        posts: postsCount,
      },
    };
  }

  /**
   * Update admin profile (name, avatar, password)
   */
  async updateAdminProfile(userId: string, dto: UpdateAdminProfileDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updateData: any = {};

    // Update name if provided
    if (dto.name) {
      updateData.displayName = dto.name;
    }

    // Update avatar if provided
    if (dto.avatarUrl) {
      updateData.avatar = dto.avatarUrl;
    }

    // Handle password change
    if (dto.currentPassword && dto.newPassword) {
      // Verify current password
      const isPasswordValid = await bcrypt.compare(
        dto.currentPassword,
        user.passwordHash,
      );

      if (!isPasswordValid) {
        throw new BadRequestException('Mot de passe actuel incorrect');
      }

      // Hash new password
      const newPasswordHash = await bcrypt.hash(dto.newPassword, 10);
      updateData.passwordHash = newPasswordHash;
    }

    // Update user
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        displayName: true,
        avatar: true,
        role: true,
      },
    });

    // Log audit event
    await this.prisma.auditLog.create({
      data: {
          id: crypto.randomUUID(),
        userId,
        event: 'ADMIN_PROFILE_UPDATED',
        resource: 'User',
        meta: {
          updatedFields: Object.keys(updateData),
        },
      },
    });

    return updatedUser;
  }

  /**
   * Update admin preferences (language, notifications, display)
   */
  async updateAdminPreferences(userId: string, dto: UpdateAdminPreferencesDto) {
    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Preferences are stored in User.preferences JSON field
    const currentSettings = (user.preferences as any) || {};

    const updatedSettings = {
      ...currentSettings,
      ...(dto.language && { language: dto.language }),
      ...(dto.emailNotifications !== undefined && { emailNotifications: dto.emailNotifications }),
      ...(dto.pushNotifications !== undefined && { pushNotifications: dto.pushNotifications }),
      ...(dto.compactMode !== undefined && { compactMode: dto.compactMode }),
    };

    // Update user preferences
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        preferences: updatedSettings,
      },
    });

    // Update admin lastLogin timestamp
    // Note: 'admin' model does not exist in Prisma schema - commenting out
    // await this.prisma.admin.updateMany({
    //   where: { userId },
    //   data: {
    //     lastLogin: new Date(),
    //   },
    // });

    // Log audit event
    await this.prisma.auditLog.create({
      data: {
          id: crypto.randomUUID(),
        userId,
        event: 'ADMIN_PREFERENCES_UPDATED',
        resource: 'User',
        meta: {
          updatedPreferences: Object.keys(dto),
        },
      },
    });

    return {
      success: true,
      preferences: updatedSettings,
    };
  }
}
