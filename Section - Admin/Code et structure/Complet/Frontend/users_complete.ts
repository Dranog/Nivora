// apps/api/src/modules/admin/services/users.service.ts

import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { AuditLogService } from './audit-log.service';
import { EmailService } from '../../email/email.service';
import { randomBytes } from 'crypto';
import { hash } from 'bcrypt';
import { Parser } from 'json2csv';

interface GetUsersQueryDto {
  role?: 'ALL' | 'ADMIN' | 'MODERATOR' | 'CREATOR' | 'FAN';
  status?: 'ALL' | 'VERIFIED' | 'PENDING' | 'SUSPENDED' | 'PENDING_KYC';
  search?: string;
  page: number;
  limit: number;
  sortBy: 'createdAt' | 'lastLogin' | 'email' | 'username';
  sortOrder: 'asc' | 'desc';
}

interface SuspendUserDto {
  reason: string;
  duration?: number;
  notifyUser: boolean;
}

interface BulkSuspendDto {
  userIds: string[];
  reason: string;
  duration?: number;
}

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService,
    private readonly emailService: EmailService,
  ) {}

  async findAll(query: GetUsersQueryDto) {
    try {
      const { role, status, search, page, limit, sortBy, sortOrder } = query;

      const where: any = {};

      if (role && role !== 'ALL') {
        where.role = role;
      }

      if (status) {
        switch (status) {
          case 'VERIFIED':
            where.emailVerified = true;
            where.kycStatus = 'VERIFIED';
            break;
          case 'PENDING':
            where.emailVerified = false;
            break;
          case 'SUSPENDED':
            where.suspendedUntil = { gt: new Date() };
            break;
          case 'PENDING_KYC':
            where.kycStatus = 'PENDING';
            break;
        }
      }

      if (search) {
        where.OR = [
          { email: { contains: search, mode: 'insensitive' } },
          { username: { contains: search, mode: 'insensitive' } },
          { displayName: { contains: search, mode: 'insensitive' } },
        ];
      }

      const total = await this.prisma.user.count({ where });

      const users = await this.prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        select: {
          id: true,
          email: true,
          username: true,
          displayName: true,
          avatar: true,
          role: true,
          emailVerified: true,
          kycStatus: true,
          createdAt: true,
          lastLogin: true,
          suspendedUntil: true,
        },
      });

      const formattedUsers = users.map((user) => ({
        ...user,
        status: this.getUserStatus(user),
        createdAt: user.createdAt.toISOString(),
        lastLogin: user.lastLogin?.toISOString() || null,
      }));

      return {
        users: formattedUsers,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      this.logger.error('Error fetching users', error);
      throw error;
    }
  }

  async findById(userId: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          _count: {
            select: {
              posts: true,
              followers: true,
              following: true,
            },
          },
          kycVerification: {
            select: {
              id: true,
              status: true,
              provider: true,
              createdAt: true,
              reviewedAt: true,
            },
          },
        },
      });

      if (!user) {
        throw new NotFoundException(`User ${userId} not found`);
      }

      const [totalSpent, recentActivity, transactions, reports] = await Promise.all([
        this.prisma.payment.aggregate({
          where: { userId, status: 'SUCCESS' },
          _sum: { amount: true },
        }),
        this.prisma.auditLog.findMany({
          where: {
            OR: [
              { actorId: userId },
              { targetId: userId, targetType: 'user' },
            ],
          },
          take: 10,
          orderBy: { timestamp: 'desc' },
          include: {
            actor: {
              select: { username: true, avatar: true },
            },
          },
        }),
        this.prisma.payment.findMany({
          where: { userId },
          take: 20,
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.report.findMany({
          where: {
            OR: [
              { reporterId: userId },
              { targetId: userId, targetType: 'USER' },
            ],
          },
          take: 10,
          orderBy: { createdAt: 'desc' },
        }),
      ]);

      return {
        ...user,
        stats: {
          totalSpent: totalSpent._sum.amount || 0,
          postsCount: user._count.posts,
          followersCount: user._count.followers,
          followingCount: user._count.following,
        },
        recentActivity,
        transactions,
        reports,
      };
    } catch (error) {
      this.logger.error(`Error fetching user ${userId}`, error);
      throw error;
    }
  }

  async suspendUser(userId: string, dto: SuspendUserDto, adminId: string, request: any) {
    try {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });

      if (!user) {
        throw new NotFoundException(`User ${userId} not found`);
      }

      if (user.role === 'ADMIN') {
        throw new BadRequestException('Cannot suspend admin users');
      }

      const suspendedUntil = dto.duration
        ? new Date(Date.now() + dto.duration * 24 * 60 * 60 * 1000)
        : null;

      const updated = await this.prisma.user.update({
        where: { id: userId },
        data: {
          suspendedUntil,
          suspensionReason: dto.reason,
        },
      });

      await this.auditLog.log({
        actorId: adminId,
        action: 'user.suspend',
        targetType: 'user',
        targetId: userId,
        metadata: {
          reason: dto.reason,
          duration: dto.duration,
          suspendedUntil: suspendedUntil?.toISOString(),
        },
        request,
      });

      if (dto.notifyUser) {
        await this.sendSuspensionEmail(user, dto.reason, suspendedUntil);
      }

      this.logger.log(`User ${userId} suspended by admin ${adminId}`);

      return {
        success: true,
        user: updated,
      };
    } catch (error) {
      this.logger.error('Error suspending user', error);
      throw error;
    }
  }

  async unsuspendUser(userId: string, adminId: string, request: any) {
    try {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });

      if (!user) {
        throw new NotFoundException(`User ${userId} not found`);
      }

      const updated = await this.prisma.user.update({
        where: { id: userId },
        data: {
          suspendedUntil: null,
          suspensionReason: null,
        },
      });

      await this.auditLog.log({
        actorId: adminId,
        action: 'user.unsuspend',
        targetType: 'user',
        targetId: userId,
        metadata: {},
        request,
      });

      await this.emailService.sendAccountReactivatedEmail(user);

      this.logger.log(`User ${userId} unsuspended by admin ${adminId}`);

      return {
        success: true,
        user: updated,
      };
    } catch (error) {
      this.logger.error('Error unsuspending user', error);
      throw error;
    }
  }

  async bulkSuspend(dto: BulkSuspendDto, adminId: string, request: any) {
    try {
      const suspendedUntil = dto.duration
        ? new Date(Date.now() + dto.duration * 24 * 60 * 60 * 1000)
        : null;

      const users = await this.prisma.user.findMany({
        where: {
          id: { in: dto.userIds },
          role: { not: 'ADMIN' },
        },
      });

      if (users.length === 0) {
        throw new BadRequestException('No valid users to suspend');
      }

      await this.prisma.user.updateMany({
        where: {
          id: { in: users.map((u) => u.id) },
        },
        data: {
          suspendedUntil,
          suspensionReason: dto.reason,
        },
      });

      await this.auditLog.log({
        actorId: adminId,
        action: 'users.bulk-suspend',
        targetType: 'user',
        metadata: {
          userIds: users.map((u) => u.id),
          count: users.length,
          reason: dto.reason,
          duration: dto.duration,
        },
        request,
      });

      // Send emails to all suspended users
      for (const user of users) {
        await this.sendSuspensionEmail(user, dto.reason, suspendedUntil);
      }

      this.logger.log(`${users.length} users suspended by admin ${adminId}`);

      return {
        success: true,
        suspended: users.length,
      };
    } catch (error) {
      this.logger.error('Error bulk suspending users', error);
      throw error;
    }
  }

  async resetPassword(userId: string, adminId: string, request: any) {
    try {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });

      if (!user) {
        throw new NotFoundException(`User ${userId} not found`);
      }

      const tempPassword = this.generateTempPassword();
      const hashedPassword = await hash(tempPassword, 10);

      await this.prisma.user.update({
        where: { id: userId },
        data: {
          passwordHash: hashedPassword,
          passwordResetRequired: true,
        },
      });

      await this.auditLog.log({
        actorId: adminId,
        action: 'user.password-reset',
        targetType: 'user',
        targetId: userId,
        metadata: {},
        request,
      });

      await this.sendPasswordResetEmail(user, tempPassword);

      this.logger.log(`Password reset for user ${userId} by admin ${adminId}`);

      return {
        success: true,
        temporaryPassword: tempPassword,
        message: 'Password reset email sent to user',
      };
    } catch (error) {
      this.logger.error('Error resetting password', error);
      throw error;
    }
  }

  async deleteUser(userId: string, adminId: string, request: any) {
    try {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });

      if (!user) {
        throw new NotFoundException(`User ${userId} not found`);
      }

      if (user.role === 'ADMIN') {
        throw new BadRequestException('Cannot delete admin users');
      }

      // Soft delete - mark as deleted instead of removing
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          deletedAt: new Date(),
          email: `deleted_${userId}@deleted.com`,
          username: `deleted_${userId}`,
        },
      });

      await this.auditLog.log({
        actorId: adminId,
        action: 'user.delete',
        targetType: 'user',
        targetId: userId,
        metadata: {
          originalEmail: user.email,
          originalUsername: user.username,
        },
        request,
      });

      this.logger.log(`User ${userId} deleted by admin ${adminId}`);

      return {
        success: true,
        message: 'User account deleted',
      };
    } catch (error) {
      this.logger.error('Error deleting user', error);
      throw error;
    }
  }

  async exportToCSV(query: GetUsersQueryDto): Promise<string> {
    try {
      const { role, status, search } = query;
      const where: any = {};

      if (role && role !== 'ALL') where.role = role;
      if (status && status !== 'ALL') {
        switch (status) {
          case 'VERIFIED':
            where.emailVerified = true;
            where.kycStatus = 'VERIFIED';
            break;
          case 'PENDING':
            where.emailVerified = false;
            break;
          case 'SUSPENDED':
            where.suspendedUntil = { gt: new Date() };
            break;
          case 'PENDING_KYC':
            where.kycStatus = 'PENDING';
            break;
        }
      }
      if (search) {
        where.OR = [
          { email: { contains: search, mode: 'insensitive' } },
          { username: { contains: search, mode: 'insensitive' } },
        ];
      }

      const users = await this.prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          username: true,
          displayName: true,
          role: true,
          emailVerified: true,
          kycStatus: true,
          createdAt: true,
          lastLogin: true,
          suspendedUntil: true,
        },
      });

      const formattedUsers = users.map((user) => ({
        id: user.id,
        email: user.email,
        username: user.username,
        displayName: user.displayName,
        role: user.role,
        emailVerified: user.emailVerified,
        kycStatus: user.kycStatus,
        status: this.getUserStatus(user),
        createdAt: user.createdAt.toISOString(),
        lastLogin: user.lastLogin?.toISOString() || 'Never',
      }));

      const fields = [
        'id',
        'email',
        'username',
        'displayName',
        'role',
        'emailVerified',
        'kycStatus',
        'status',
        'createdAt',
        'lastLogin',
      ];
      const parser = new Parser({ fields });
      const csv = parser.parse(formattedUsers);

      this.logger.log(`Exported ${users.length} users to CSV`);

      return csv;
    } catch (error) {
      this.logger.error('Error exporting users to CSV', error);
      throw error;
    }
  }

  // PRIVATE HELPERS

  private getUserStatus(user: any): string {
    if (user.suspendedUntil && user.suspendedUntil > new Date()) {
      return 'SUSPENDED';
    }
    if (user.kycStatus === 'PENDING') {
      return 'PENDING_KYC';
    }
    if (!user.emailVerified) {
      return 'PENDING';
    }
    if (user.emailVerified && user.kycStatus === 'VERIFIED') {
      return 'VERIFIED';
    }
    return 'ACTIVE';
  }

  private generateTempPassword(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%';
    let password = '';
    const bytes = randomBytes(12);
    for (let i = 0; i < 12; i++) {
      password += chars[bytes[i] % chars.length];
    }
    return password;
  }

  private async sendSuspensionEmail(user: any, reason: string, until: Date | null): Promise<void> {
    try {
      await this.emailService.sendSuspensionEmail(user, reason, until);
      this.logger.log(`Suspension email sent to ${user.email}`);
    } catch (error) {
      this.logger.error(`Failed to send suspension email to ${user.email}`, error);
    }
  }

  private async sendPasswordResetEmail(user: any, tempPassword: string): Promise<void> {
    try {
      await this.emailService.sendPasswordResetEmail(user, tempPassword);
      this.logger.log(`Password reset email sent to ${user.email}`);
    } catch (error) {
      this.logger.error(`Failed to send password reset email to ${user.email}`, error);
    }
  }
}

// ========================================
// CONTROLLER
// ========================================

import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  Body,
  Req,
  Res,
  UseGuards,
  HttpStatus,
  HttpCode,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { UsersService } from '../services/users.service';
import { AdminRoleGuard } from '../guards/admin-role.guard';
import { PermissionsGuard } from '../guards/permissions.guard';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RateLimitGuard } from '../../../common/guards/rate-limit.guard';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe';
import { RequirePermission } from '../decorators/permissions.decorator';
import { z } from 'zod';

const GetUsersQuerySchema = z.object({
  role: z.enum(['ALL', 'ADMIN', 'MODERATOR', 'CREATOR', 'FAN']).optional(),
  status: z.enum(['ALL', 'VERIFIED', 'PENDING', 'SUSPENDED', 'PENDING_KYC']).optional(),
  search: z.string().optional(),
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(100).optional().default(50),
  sortBy: z.enum(['createdAt', 'lastLogin', 'email', 'username']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

const SuspendUserSchema = z.object({
  reason: z.string().min(10).max(500),
  duration: z.number().min(1).max(365).optional(),
  notifyUser: z.boolean().default(true),
});

const BulkSuspendSchema = z.object({
  userIds: z.array(z.string()).min(1).max(100),
  reason: z.string().min(10).max(500),
  duration: z.number().min(1).max(365).optional(),
});

@ApiTags('Admin - Users')
@ApiBearerAuth()
@Controller('admin/users')
@UseGuards(JwtAuthGuard, AdminRoleGuard, RateLimitGuard)
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(private readonly usersService: UsersService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getUsers(@Query(new ZodValidationPipe(GetUsersQuerySchema)) query: any) {
    this.logger.log(`Fetching users: page=${query.page}, role=${query.role}`);
    return this.usersService.findAll(query);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getUserById(@Param('id') userId: string) {
    this.logger.log(`Fetching user details: ${userId}`);
    return this.usersService.findById(userId);
  }

  @Post(':id/suspend')
  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionsGuard)
  @RequirePermission('users.suspend')
  async suspendUser(
    @Param('id') userId: string,
    @Body(new ZodValidationPipe(SuspendUserSchema)) dto: any,
    @Req() req: any,
  ) {
    this.logger.log(`Suspending user ${userId} by admin ${req.user.id}`);
    return this.usersService.suspendUser(userId, dto, req.user.id, req);
  }

  @Post(':id/unsuspend')
  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionsGuard)
  @RequirePermission('users.suspend')
  async unsuspendUser(@Param('id') userId: string, @Req() req: any) {
    this.logger.log(`Unsuspending user ${userId} by admin ${req.user.id}`);
    return this.usersService.unsuspendUser(userId, req.user.id, req);
  }

  @Post('bulk-suspend')
  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionsGuard)
  @RequirePermission('users.suspend')
  async bulkSuspend(
    @Body(new ZodValidationPipe(BulkSuspendSchema)) dto: any,
    @Req() req: any,
  ) {
    this.logger.log(`Bulk suspending ${dto.userIds.length} users by admin ${req.user.id}`);
    return this.usersService.bulkSuspend(dto, req.user.id, req);
  }

  @Post(':id/reset-password')
  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionsGuard)
  @RequirePermission('users.write')
  async resetPassword(@Param('id') userId: string, @Req() req: any) {
    this.logger.log(`Resetting password for user ${userId} by admin ${req.user.id}`);
    return this.usersService.resetPassword(userId, req.user.id, req);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionsGuard)
  @RequirePermission('users.delete')
  async deleteUser(@Param('id') userId: string, @Req() req: any) {
    this.logger.log(`Deleting user ${userId} by admin ${req.user.id}`);
    return this.usersService.deleteUser(userId, req.user.id, req);
  }

  @Get('export.csv')
  @HttpCode(HttpStatus.OK)
  async exportUsers(
    @Query(new ZodValidationPipe(GetUsersQuerySchema)) query: any,
    @Res() res: Response,
  ) {
    this.logger.log('Exporting users to CSV');
    const csv = await this.usersService.exportToCSV(query);
    
    res.header('Content-Type', 'text/csv');
    res.header('Content-Disposition', 'attachment; filename=users-export.csv');
    return res.send(csv);
  }
}