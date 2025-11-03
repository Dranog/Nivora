// apps/api/src/modules/admin/core/controllers/users.controller.ts

import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UsersService } from '../services/users.service';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { AdminRoleGuard } from '../../guards/admin-role.guard';
import { PermissionsGuard } from '../../guards/permissions.guard';
import { RateLimitGuard } from '../../../../common/guards/rate-limit.guard';
import { RequirePermissions } from '../../decorators/permissions.decorator';
import { ZodValidationPipe } from '../../../../common/pipes/zod-validation.pipe';
import { z } from 'zod';

// Validation Schemas
const GetUsersQuerySchema = z.object({
  search: z.string().optional(),
  role: z.enum(['ALL', 'USER', 'CREATOR', 'MODERATOR', 'ADMIN']).optional(),
  status: z.enum(['ALL', 'ACTIVE', 'SUSPENDED', 'BANNED', 'DELETED']).optional(),
  kycStatus: z.enum(['ALL', 'NOT_STARTED', 'PENDING', 'VERIFIED', 'REJECTED']).optional(),
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(50),
});

const UpdateUserSchema = z.object({
  username: z.string().min(3).max(30).optional(),
  email: z.string().email().optional(),
  displayName: z.string().min(1).max(50).optional(),
  role: z.enum(['USER', 'CREATOR', 'MODERATOR', 'ADMIN']).optional(),
  status: z.enum(['ACTIVE', 'SUSPENDED', 'BANNED', 'DELETED']).optional(),
});

const SuspendUserSchema = z.object({
  reason: z.string().min(10).max(500),
  permanent: z.boolean().default(false),
  duration: z.number().min(1).max(365).optional(),
});

@ApiTags('Admin - Users')
@ApiBearerAuth()
@Controller('admin/users')
@UseGuards(JwtAuthGuard, AdminRoleGuard, RateLimitGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionsGuard)
  @RequirePermissions('users.read.all')
  @ApiOperation({ summary: 'Get all users with filters' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  async getUsers(@Query(new ZodValidationPipe(GetUsersQuerySchema)) query: any) {
    return this.usersService.findAll(query);
  }

  @Get('statistics')
  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionsGuard)
  @RequirePermissions('users.read.all')
  @ApiOperation({ summary: 'Get user statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  async getStatistics() {
    return this.usersService.getStatistics();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionsGuard)
  @RequirePermissions('users.read.all')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, description: 'User found' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUserById(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionsGuard)
  @RequirePermissions('users.write')
  @ApiOperation({ summary: 'Update user' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 409, description: 'Username or email already taken' })
  async updateUser(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateUserSchema)) dto: any,
    @Req() req: any,
  ) {
    return this.usersService.update(id, dto, req.user.id, req);
  }

  @Post(':id/suspend')
  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionsGuard)
  @RequirePermissions('users.suspend')
  @ApiOperation({ summary: 'Suspend user' })
  @ApiResponse({ status: 200, description: 'User suspended successfully' })
  @ApiResponse({ status: 400, description: 'Cannot suspend admin users' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async suspendUser(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(SuspendUserSchema)) dto: any,
    @Req() req: any,
  ) {
    return this.usersService.suspend(id, dto, req.user.id, req);
  }

  @Post(':id/unsuspend')
  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionsGuard)
  @RequirePermissions('users.unsuspend')
  @ApiOperation({ summary: 'Unsuspend user' })
  @ApiResponse({ status: 200, description: 'User unsuspended successfully' })
  @ApiResponse({ status: 400, description: 'User is not suspended' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async unsuspendUser(@Param('id') id: string, @Req() req: any) {
    return this.usersService.unsuspend(id, req.user.id, req);
  }

  @Post(':id/reset-password')
  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionsGuard)
  @RequirePermissions('users.reset-password')
  @ApiOperation({ summary: 'Reset user password' })
  @ApiResponse({ status: 200, description: 'Password reset successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async resetPassword(@Param('id') id: string, @Req() req: any) {
    return this.usersService.resetPassword(id, req.user.id, req);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionsGuard)
  @RequirePermissions('users.delete')
  @ApiOperation({ summary: 'Delete user (soft delete)' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 400, description: 'Cannot delete admin users' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async deleteUser(@Param('id') id: string, @Req() req: any) {
    return this.usersService.delete(id, req.user.id, req);
  }
}
