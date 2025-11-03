import type { Request } from 'express';
import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AdminService } from './admin.service';
import { ResolveFlagDto, updateAdminProfileSchema, updateAdminPreferencesSchema } from './dto';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  constructor(private adminService: AdminService) {}

  /**
   * GET /admin/flags
   * Get list of content flags/reports
   */
  @Get('flags')
  @Roles('ADMIN', 'SUPPORT')
  async getFlags(
    @Query('status') status?: string,
    @Query('type') type?: string,
    @Query('limit') limit = 50,
    @Query('offset') offset = 0,
  ) {
    return this.adminService.getFlags(
      { status, type },
      { limit: Number(limit), offset: Number(offset) },
    );
  }

  /**
   * POST /admin/flags/:id/resolve
   * Resolve a content flag
   */
  @Post('flags/:id/resolve')
  @Roles('ADMIN')
  async resolveFlag(@Param('id') id: string, @Body() dto: ResolveFlagDto, @Req() req: Request) {
    return this.adminService.resolveFlag(id, req.user!.id, dto.action, dto.notes);
  }

  /**
   * GET /admin/stats
   * Get platform-wide statistics
   */
  @Get('stats')
  @Roles('ADMIN')
  async getPlatformStats() {
    return this.adminService.getPlatformStats();
  }

  /**
   * PATCH /admin/profile
   * Update admin profile (name, avatar, password)
   */
  @Patch('profile')
  @Roles('ADMIN', 'SUPPORT')
  async updateProfile(
    @Req() req: Request,
    @Body(new ZodValidationPipe(updateAdminProfileSchema)) dto: any,
  ) {
    return this.adminService.updateAdminProfile(req.user!.id, dto);
  }

  /**
   * PATCH /admin/preferences
   * Update admin preferences (language, notifications, display)
   */
  @Patch('preferences')
  @Roles('ADMIN', 'SUPPORT')
  async updatePreferences(
    @Req() req: Request,
    @Body(new ZodValidationPipe(updateAdminPreferencesSchema)) dto: any,
  ) {
    return this.adminService.updateAdminPreferences(req.user!.id, dto);
  }
}
