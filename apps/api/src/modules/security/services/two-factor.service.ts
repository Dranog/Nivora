import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';
import { randomUUID } from 'crypto';

@Injectable()
export class TwoFactorService {
  constructor(private prisma: PrismaService) {}

  /**
   * Generate 2FA secret and QR code for user
   */
  async generateSecret(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, twoFactorEnabled: true },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.twoFactorEnabled) {
      throw new BadRequestException('2FA is already enabled for this account');
    }

    // Generate secret
    const secret = speakeasy.generateSecret({
      name: `OLIVER Platform (${user.email})`,
      issuer: 'OLIVER',
      length: 32,
    });

    // Generate QR code as data URL
    const qrCodeDataUrl = await QRCode.toDataURL(secret.otpauth_url!);

    return {
      secret: secret.base32,
      qrCode: qrCodeDataUrl,
      otpauthUrl: secret.otpauth_url,
    };
  }

  /**
   * Enable 2FA for user after verifying token
   */
  async enable(userId: string, secret: string, token: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { twoFactorEnabled: true },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.twoFactorEnabled) {
      throw new BadRequestException('2FA is already enabled');
    }

    // Verify token
    const isValid = this.verifyToken(secret, token);

    if (!isValid) {
      throw new BadRequestException('Invalid 2FA token');
    }

    // Enable 2FA and save secret
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorEnabled: true,
        twoFactorSecret: secret,
      },
    });

    // Log audit event
    await this.prisma.auditLog.create({
      data: {
        id: randomUUID(),
        userId,
        event: '2FA_ENABLED',
        resource: 'User',
        meta: {
          timestamp: new Date().toISOString(),
        },
      },
    });

    return { success: true, message: '2FA enabled successfully' };
  }

  /**
   * Disable 2FA for user
   */
  async disable(userId: string, token: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { twoFactorEnabled: true, twoFactorSecret: true },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (!user.twoFactorEnabled) {
      throw new BadRequestException('2FA is not enabled');
    }

    // Verify token before disabling
    const isValid = this.verifyToken(user.twoFactorSecret!, token);

    if (!isValid) {
      throw new BadRequestException('Invalid 2FA token');
    }

    // Disable 2FA
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null,
      },
    });

    // Log audit event
    await this.prisma.auditLog.create({
      data: {
        id: randomUUID(),
        userId,
        event: '2FA_DISABLED',
        resource: 'User',
        meta: {
          timestamp: new Date().toISOString(),
        },
      },
    });

    return { success: true, message: '2FA disabled successfully' };
  }

  /**
   * Verify 2FA token
   */
  verifyToken(secret: string, token: string): boolean {
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 2, // Allow 2 time steps before/after for clock skew
    });
  }

  /**
   * Validate 2FA during login
   */
  async validateLogin(userId: string, token: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { twoFactorEnabled: true, twoFactorSecret: true },
    });

    if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) {
      return false;
    }

    const isValid = this.verifyToken(user.twoFactorSecret, token);

    if (isValid) {
      // Log successful 2FA verification
      await this.prisma.auditLog.create({
        data: {
          id: randomUUID(),
          userId,
          event: '2FA_VERIFIED',
          resource: 'Auth',
          meta: {
            timestamp: new Date().toISOString(),
            success: true,
          },
        },
      });
    } else {
      // Log failed 2FA attempt
      await this.prisma.auditLog.create({
        data: {
          id: randomUUID(),
          userId,
          event: '2FA_FAILED',
          resource: 'Auth',
          meta: {
            timestamp: new Date().toISOString(),
            success: false,
          },
        },
      });
    }

    return isValid;
  }

  /**
   * Check if user has 2FA enabled
   */
  async isEnabled(userId: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { twoFactorEnabled: true },
    });

    return user?.twoFactorEnabled ?? false;
  }

  /**
   * Generate backup codes (recovery codes)
   */
  async generateBackupCodes(userId: string): Promise<string[]> {
    const codes: string[] = [];

    // Generate 8 backup codes
    for (let i = 0; i < 8; i++) {
      const code = Math.random().toString(36).substring(2, 10).toUpperCase();
      codes.push(code);
    }

    // Hash and store backup codes
    const hashedCodes = codes.map(code =>
      require('crypto').createHash('sha256').update(code).digest('hex')
    );

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        metadata: {
          ...(await this.prisma.user.findUnique({ where: { id: userId }, select: { metadata: true } }).then(u => u?.metadata as any || {})),
          backupCodes: hashedCodes,
        },
      },
    });

    // Log audit event
    await this.prisma.auditLog.create({
      data: {
        id: randomUUID(),
        userId,
        event: '2FA_BACKUP_CODES_GENERATED',
        resource: 'User',
        meta: {
          codesCount: codes.length,
          timestamp: new Date().toISOString(),
        },
      },
    });

    return codes;
  }
}
