// apps/api/src/modules/admin/services/__tests__/users.service.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { UsersService } from '../users.service';
import { PrismaService } from '../../../database/prisma.service';
import { EmailService } from '../../../email/email.service';
import { AuditLogService } from '../audit-log.service';
import { ModerationGateway } from '../../gateways/moderation.gateway';

describe('UsersService', () => {
  let service: UsersService;
  let prismaService: PrismaService;
  let emailService: EmailService;
  let auditLogService: AuditLogService;
  let moderationGateway: ModerationGateway;

  const mockPrismaService = {
    user: {
      count: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      groupBy: jest.fn(),
    },
    payment: {
      aggregate: jest.fn(),
      findMany: jest.fn(),
    },
    payout: {
      aggregate: jest.fn(),
    },
    post: {
      findMany: jest.fn(),
    },
    report: {
      findMany: jest.fn(),
    },
  };

  const mockEmailService = {
    sendSuspensionEmail: jest.fn(),
    sendPasswordResetEmail: jest.fn(),
  };

  const mockAuditLogService = {
    log: jest.fn(),
  };

  const mockModerationGateway = {
    notifyDashboardUpdate: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: EmailService, useValue: mockEmailService },
        { provide: AuditLogService, useValue: mockAuditLogService },
        { provide: ModerationGateway, useValue: mockModerationGateway },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prismaService = module.get<PrismaService>(PrismaService);
    emailService = module.get<EmailService>(EmailService);
    auditLogService = module.get<AuditLogService>(AuditLogService);
    moderationGateway = module.get<ModerationGateway>(ModerationGateway);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated users', async () => {
      const mockUsers = [
        {
          id: 'user-1',
          username: 'testuser1',
          email: 'test1@example.com',
          role: 'USER',
          status: 'ACTIVE',
          createdAt: new Date(),
          _count: { posts: 5, videos: 2, payments: 10, reportsMade: 1 },
        },
        {
          id: 'user-2',
          username: 'testuser2',
          email: 'test2@example.com',
          role: 'CREATOR',
          status: 'ACTIVE',
          createdAt: new Date(),
          _count: { posts: 15, videos: 5, payments: 20, reportsMade: 0 },
        },
      ];

      mockPrismaService.user.findMany.mockResolvedValue(mockUsers);

      const result = await service.findAll({ limit: 50 });

      expect(result.items).toHaveLength(2);
      expect(result.hasMore).toBe(false);
      expect(result.nextCursor).toBeNull();
      expect(mockPrismaService.user.findMany).toHaveBeenCalledTimes(1);
    });

    it('should filter users by search term', async () => {
      const mockUsers = [
        {
          id: 'user-1',
          username: 'johndoe',
          email: 'john@example.com',
          role: 'USER',
          status: 'ACTIVE',
          createdAt: new Date(),
          _count: { posts: 5, videos: 2, payments: 10, reportsMade: 1 },
        },
      ];

      mockPrismaService.user.findMany.mockResolvedValue(mockUsers);

      await service.findAll({ search: 'john', limit: 50 });

      expect(mockPrismaService.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              { username: { contains: 'john', mode: 'insensitive' } },
              { email: { contains: 'john', mode: 'insensitive' } },
            ]),
          }),
        }),
      );
    });

    it('should handle cursor-based pagination', async () => {
      const mockUsers = Array(51).fill(null).map((_, i) => ({
        id: `user-${i}`,
        username: `user${i}`,
        email: `user${i}@example.com`,
        role: 'USER',
        status: 'ACTIVE',
        createdAt: new Date(),
        _count: { posts: 0, videos: 0, payments: 0, reportsMade: 0 },
      }));

      mockPrismaService.user.findMany.mockResolvedValue(mockUsers);

      const result = await service.findAll({ limit: 50 });

      expect(result.items).toHaveLength(50);
      expect(result.hasMore).toBe(true);
      expect(result.nextCursor).toBe('user-49');
    });
  });

  describe('findById', () => {
    it('should return user details with statistics', async () => {
      const mockUser = {
        id: 'user-1',
        username: 'testuser',
        email: 'test@example.com',
        role: 'USER',
        status: 'ACTIVE',
        createdAt: new Date(),
        kycVerification: null,
        _count: { posts: 5, videos: 2, payments: 10, reportsMade: 1 },
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.payment.findMany.mockResolvedValue([]);
      mockPrismaService.post.findMany.mockResolvedValue([]);
      mockPrismaService.report.findMany.mockResolvedValue([]);
      mockPrismaService.payment.aggregate.mockResolvedValue({ _sum: { amount: 50000 } });
      mockPrismaService.payout.aggregate.mockResolvedValue({ _sum: { amount: 10000 } });

      const result = await service.findById('user-1');

      expect(result.id).toBe('user-1');
      expect(result.username).toBe('testuser');
      expect(result.statistics.totalSpent).toBe(50000);
      expect(result.statistics.totalEarned).toBe(10000);
      expect(result.password).toBeUndefined();
    });

    it('should throw NotFoundException if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.findById('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update user successfully', async () => {
      const existingUser = {
        id: 'user-1',
        username: 'oldusername',
        email: 'old@example.com',
      };

      const updatedUser = {
        id: 'user-1',
        username: 'newusername',
        email: 'new@example.com',
        displayName: 'New Name',
      };

      mockPrismaService.user.findUnique
        .mockResolvedValueOnce(existingUser)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);
      mockPrismaService.user.update.mockResolvedValue(updatedUser);

      const result = await service.update(
        'user-1',
        { username: 'newusername', email: 'new@example.com', displayName: 'New Name' },
        'admin-1',
        { headers: {}, connection: {} },
      );

      expect(result.success).toBe(true);
      expect(result.user.username).toBe('newusername');
      expect(mockAuditLogService.log).toHaveBeenCalledWith(
        expect.objectContaining({
          actorId: 'admin-1',
          action: 'user.update',
          targetType: 'user',
          targetId: 'user-1',
        }),
      );
    });

    it('should throw ConflictException if username already exists', async () => {
      const existingUser = { id: 'user-1', username: 'oldname', email: 'test@example.com' };
      const conflictUser = { id: 'user-2', username: 'newname', email: 'other@example.com' };

      mockPrismaService.user.findUnique
        .mockResolvedValueOnce(existingUser)
        .mockResolvedValueOnce(conflictUser);

      await expect(
        service.update('user-1', { username: 'newname' }, 'admin-1', {}),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(
        service.update('non-existent', { username: 'test' }, 'admin-1', {}),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('suspend', () => {
    it('should suspend user successfully', async () => {
      const user = {
        id: 'user-1',
        username: 'testuser',
        email: 'test@example.com',
        role: 'USER',
      };

      const suspendedUser = {
        ...user,
        status: 'SUSPENDED',
        suspendedUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        suspensionReason: 'Violation of terms',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(user);
      mockPrismaService.user.update.mockResolvedValue(suspendedUser);

      const result = await service.suspend(
        'user-1',
        { reason: 'Violation of terms', permanent: false },
        'admin-1',
        { headers: {}, connection: {} },
      );

      expect(result.success).toBe(true);
      expect(result.user.status).toBe('SUSPENDED');
      expect(mockEmailService.sendSuspensionEmail).toHaveBeenCalled();
      expect(mockAuditLogService.log).toHaveBeenCalled();
      expect(mockModerationGateway.notifyDashboardUpdate).toHaveBeenCalled();
    });

    it('should throw BadRequestException when trying to suspend admin', async () => {
      const adminUser = {
        id: 'admin-1',
        username: 'admin',
        email: 'admin@example.com',
        role: 'ADMIN',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(adminUser);

      await expect(
        service.suspend('admin-1', { reason: 'Test' }, 'admin-2', {}),
      ).rejects.toThrow(BadRequestException);
    });

    it('should handle permanent suspension', async () => {
      const user = {
        id: 'user-1',
        username: 'testuser',
        email: 'test@example.com',
        role: 'USER',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(user);
      mockPrismaService.user.update.mockResolvedValue({
        ...user,
        status: 'SUSPENDED',
        suspendedUntil: null,
        suspensionReason: 'Permanent ban',
      });

      const result = await service.suspend(
        'user-1',
        { reason: 'Permanent ban', permanent: true },
        'admin-1',
        { headers: {}, connection: {} },
      );

      expect(result.user.suspendedUntil).toBeNull();
    });
  });

  describe('unsuspend', () => {
    it('should unsuspend user successfully', async () => {
      const suspendedUser = {
        id: 'user-1',
        username: 'testuser',
        email: 'test@example.com',
        status: 'SUSPENDED',
        suspendedUntil: new Date(),
        suspensionReason: 'Test reason',
      };

      const activeUser = {
        ...suspendedUser,
        status: 'ACTIVE',
        suspendedUntil: null,
        suspensionReason: null,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(suspendedUser);
      mockPrismaService.user.update.mockResolvedValue(activeUser);

      const result = await service.unsuspend('user-1', 'admin-1', { headers: {}, connection: {} });

      expect(result.success).toBe(true);
      expect(result.user.status).toBe('ACTIVE');
      expect(result.user.suspendedUntil).toBeNull();
    });

    it('should throw BadRequestException if user is not suspended', async () => {
      const activeUser = {
        id: 'user-1',
        username: 'testuser',
        email: 'test@example.com',
        status: 'ACTIVE',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(activeUser);

      await expect(service.unsuspend('user-1', 'admin-1', {})).rejects.toThrow(BadRequestException);
    });
  });

  describe('resetPassword', () => {
    it('should reset password and send email', async () => {
      const user = {
        id: 'user-1',
        username: 'testuser',
        email: 'test@example.com',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(user);
      mockPrismaService.user.update.mockResolvedValue(user);

      const result = await service.resetPassword('user-1', 'admin-1', { headers: {}, connection: {} });

      expect(result.success).toBe(true);
      expect(mockEmailService.sendPasswordResetEmail).toHaveBeenCalled();
      expect(mockAuditLogService.log).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'user.password_reset',
        }),
      );
    });
  });

  describe('delete', () => {
    it('should soft delete user', async () => {
      const user = {
        id: 'user-1',
        username: 'testuser',
        email: 'test@example.com',
        role: 'USER',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(user);
      mockPrismaService.user.update.mockResolvedValue({
        ...user,
        username: `deleted_user_${user.id.slice(0, 8)}`,
        email: `deleted_${user.id}@deleted.com`,
        status: 'DELETED',
      });

      const result = await service.delete('user-1', 'admin-1', { headers: {}, connection: {} });

      expect(result.success).toBe(true);
      expect(mockPrismaService.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: 'DELETED',
          }),
        }),
      );
    });

    it('should throw BadRequestException when trying to delete admin', async () => {
      const adminUser = {
        id: 'admin-1',
        username: 'admin',
        email: 'admin@example.com',
        role: 'ADMIN',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(adminUser);

      await expect(service.delete('admin-1', 'admin-2', {})).rejects.toThrow(BadRequestException);
    });
  });

  describe('getStatistics', () => {
    it('should return user statistics', async () => {
      mockPrismaService.user.count
        .mockResolvedValueOnce(1000) // total
        .mockResolvedValueOnce(850)  // active
        .mockResolvedValueOnce(50)   // suspended
        .mockResolvedValueOnce(800)  // verified
        .mockResolvedValueOnce(10)   // today
        .mockResolvedValueOnce(45)   // this week
        .mockResolvedValueOnce(120); // this month

      mockPrismaService.user.groupBy.mockResolvedValue([
        { role: 'USER', _count: { id: 800 } },
        { role: 'CREATOR', _count: { id: 150 } },
        { role: 'MODERATOR', _count: { id: 40 } },
        { role: 'ADMIN', _count: { id: 10 } },
      ]);

      const stats = await service.getStatistics();

      expect(stats.total).toBe(1000);
      expect(stats.active).toBe(850);
      expect(stats.suspended).toBe(50);
      expect(stats.verified).toBe(800);
      expect(stats.newToday).toBe(10);
      expect(stats.newThisWeek).toBe(45);
      expect(stats.newThisMonth).toBe(120);
      expect(stats.roleDistribution).toEqual({
        USER: 800,
        CREATOR: 150,
        MODERATOR: 40,
        ADMIN: 10,
      });
    });
  });
});
