import { Controller, Post, Get, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { TwoFactorService } from './services/two-factor.service';
import { IPWhitelistService } from './services/ip-whitelist.service';
import { SessionManagerService } from './services/session-manager.service';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { enable2FASchema, disable2FASchema, verify2FASchema } from './dto';

@Controller('security')
@UseGuards(JwtAuthGuard)
export class SecurityController {
  constructor(
    private twoFactorService: TwoFactorService,
    private ipWhitelistService: IPWhitelistService,
    private sessionManagerService: SessionManagerService,
  ) {}

  /**
   * GET /security/2fa/generate
   * Generate 2FA secret and QR code
   */
  @Get('2fa/generate')
  async generate2FA(@Req() req: Request) {
    return this.twoFactorService.generateSecret(req.user!.id);
  }

  /**
   * POST /security/2fa/enable
   * Enable 2FA after verifying token
   */
  @Post('2fa/enable')
  async enable2FA(
    @Req() req: Request,
    @Body(new ZodValidationPipe(enable2FASchema)) dto: any,
  ) {
    return this.twoFactorService.enable(req.user!.id, dto.secret, dto.token);
  }

  /**
   * POST /security/2fa/disable
   * Disable 2FA
   */
  @Post('2fa/disable')
  async disable2FA(
    @Req() req: Request,
    @Body(new ZodValidationPipe(disable2FASchema)) dto: any,
  ) {
    return this.twoFactorService.disable(req.user!.id, dto.token);
  }

  /**
   * POST /security/2fa/verify
   * Verify 2FA token
   */
  @Post('2fa/verify')
  async verify2FA(
    @Req() req: Request,
    @Body(new ZodValidationPipe(verify2FASchema)) dto: any,
  ) {
    const isValid = await this.twoFactorService.validateLogin(req.user!.id, dto.token);
    return { valid: isValid };
  }

  /**
   * GET /security/2fa/status
   * Check if 2FA is enabled
   */
  @Get('2fa/status')
  async get2FAStatus(@Req() req: Request) {
    const enabled = await this.twoFactorService.isEnabled(req.user!.id);
    return { enabled };
  }

  /**
   * POST /security/2fa/backup-codes
   * Generate backup recovery codes
   */
  @Post('2fa/backup-codes')
  async generateBackupCodes(@Req() req: Request) {
    const codes = await this.twoFactorService.generateBackupCodes(req.user!.id);
    return { codes };
  }

  // ==========================================
  // IP WHITELIST ROUTES (Admin only)
  // ==========================================

  /**
   * GET /security/ip-whitelist
   * List all whitelisted IPs
   */
  @Get('ip-whitelist')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  async listWhitelistedIPs(@Req() req: Request) {
    return this.ipWhitelistService.list();
  }

  /**
   * POST /security/ip-whitelist
   * Add IP to whitelist
   */
  @Post('ip-whitelist')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  async addIPToWhitelist(
    @Req() req: Request,
    @Body() dto: { ipAddress: string; description?: string; expiresAt?: string },
  ) {
    const expiresAt = dto.expiresAt ? new Date(dto.expiresAt) : undefined;
    return this.ipWhitelistService.addIP(req.user!.id, dto.ipAddress, dto.description, expiresAt);
  }

  /**
   * DELETE /security/ip-whitelist/:ipAddress
   * Remove IP from whitelist
   */
  @Delete('ip-whitelist/:ipAddress')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  async removeIPFromWhitelist(@Req() req: Request, @Param('ipAddress') ipAddress: string) {
    return this.ipWhitelistService.removeIP(req.user!.id, ipAddress);
  }

  // ==========================================
  // SESSION MANAGEMENT ROUTES
  // ==========================================

  /**
   * GET /security/sessions
   * Get user's recent sessions
   */
  @Get('sessions')
  async getUserSessions(@Req() req: Request, @Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit) : 50;
    return this.sessionManagerService.getUserSessions(req.user!.id, limitNum);
  }

  /**
   * GET /security/sessions/:userId
   * Get sessions for specific user (Admin only)
   */
  @Get('sessions/:userId')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  async getSessionsByUserId(@Param('userId') userId: string, @Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit) : 50;
    return this.sessionManagerService.getUserSessions(userId, limitNum);
  }

  /**
   * POST /security/sessions/:userId/terminate
   * Terminate all sessions for user (Admin only)
   */
  @Post('sessions/:userId/terminate')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  async terminateUserSessions(@Req() req: Request, @Param('userId') userId: string) {
    return this.sessionManagerService.terminateAllSessions(userId, req.user!.id);
  }
}
