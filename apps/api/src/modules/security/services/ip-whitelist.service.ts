import { Injectable, ForbiddenException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../../common/prisma/prisma.service';

@Injectable()
export class IPWhitelistService {
  constructor(private prisma: PrismaService) {}

  /**
   * Check if IP is whitelisted
   */
  async isIPWhitelisted(ipAddress: string): Promise<boolean> {
    const whitelist = await this.prisma.ipWhitelist.findFirst({
      where: {
        ipAddress,
        enabled: true,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
      },
    });

    return !!whitelist;
  }

  /**
   * Add IP to whitelist
   */
  async addIP(adminId: string, ipAddress: string, description?: string, expiresAt?: Date) {
    // Check if IP already exists
    const existing = await this.prisma.ipWhitelist.findUnique({
      where: { ipAddress },
    });

    if (existing) {
      // Update existing entry
      return this.prisma.ipWhitelist.update({
        where: { ipAddress },
        data: {
          enabled: true,
          description,
          expiresAt,
          adminId,
        },
      });
    }

    // Create new entry
    const whitelisted = await this.prisma.ipWhitelist.create({
      data: {
        id: randomUUID(),
        ipAddress,
        adminId,
        description,
        expiresAt,
        enabled: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // Log audit event
    await this.prisma.auditLog.create({
      data: {
        id: randomUUID(),
        userId: adminId,
        event: 'IP_WHITELIST_ADDED',
        resource: 'IPWhitelist',
        meta: {
          ipAddress,
          expiresAt: expiresAt?.toISOString(),
        },
      },
    });

    return whitelisted;
  }

  /**
   * Remove IP from whitelist
   */
  async removeIP(adminId: string, ipAddress: string) {
    await this.prisma.ipWhitelist.update({
      where: { ipAddress },
      data: { enabled: false },
    });

    // Log audit event
    await this.prisma.auditLog.create({
      data: {
        id: randomUUID(),
        userId: adminId,
        event: 'IP_WHITELIST_REMOVED',
        resource: 'IPWhitelist',
        meta: { ipAddress },
      },
    });

    return { success: true };
  }

  /**
   * List all whitelisted IPs
   */
  async list(adminId?: string) {
    return this.prisma.ipWhitelist.findMany({
      where: adminId ? { adminId } : undefined,
      include: {
        user: {
          select: {
            email: true,
            displayName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Clean up expired entries
   */
  async cleanupExpired() {
    const result = await this.prisma.ipWhitelist.updateMany({
      where: {
        enabled: true,
        expiresAt: { lt: new Date() },
      },
      data: { enabled: false },
    });

    return { disabled: result.count };
  }
}
