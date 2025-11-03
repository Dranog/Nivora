import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { UserRole as Role } from '@prisma/client';
import { UsersService } from '../services/users.service';
import {
  usersQuerySchema,
  updateUserSchema,
  bulkActionSchema,
  banUserSchema,
  suspendUserSchema,
  type UsersListResponseDto,
  type AdminUserDto,
  type UserDetailDto,
  type UserStatsDto,
  type BulkActionResponseDto,
} from '../dto/users.dto';

@Controller('admin/users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.SUPPORT)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * GET /admin/users
   * Get paginated list of users with filters
   */
  @Get()
  async getUsers(@Query() query: Record<string, unknown>): Promise<UsersListResponseDto> {
    // Parse and validate query params
    const parsed = {
      page: query.page ? parseInt(query.page as string, 10) : undefined,
      limit: query.limit ? parseInt(query.limit as string, 10) : undefined,
      search: query.search as string | undefined,
      role: query.role as Role | undefined,
      status: query.status as 'ACTIVE' | 'SUSPENDED' | 'BANNED' | undefined,
      verified: query.verified === 'true' ? true : query.verified === 'false' ? false : undefined,
      sortBy: query.sortBy as 'createdAt' | 'username' | 'email' | 'revenue' | undefined,
      sortOrder: query.sortOrder as 'asc' | 'desc' | undefined,
      createdFrom: query.createdFrom as string | undefined,
      createdTo: query.createdTo as string | undefined,
    };

    const validated = usersQuerySchema.parse(parsed);
    return this.usersService.getUsers(validated);
  }

  /**
   * GET /admin/users/stats
   * Get user statistics
   */
  @Get('stats')
  async getUserStats(): Promise<UserStatsDto> {
    return this.usersService.getUserStats();
  }

  /**
   * GET /admin/users/:id
   * Get user detail by ID
   */
  @Get(':id')
  async getUserDetail(
    @Param('id') userId: string,
    @CurrentUser() admin: { id: string }
  ): Promise<UserDetailDto> {
    return this.usersService.getUserDetail(userId, admin.id);
  }

  /**
   * PUT /admin/users/:id
   * Update user
   */
  @Put(':id')
  @Roles(Role.ADMIN)
  async updateUser(
    @Param('id') userId: string,
    @Body() body: Record<string, unknown>,
    @CurrentUser() admin: { id: string }
  ): Promise<AdminUserDto> {
    const validated = updateUserSchema.parse(body);
    return this.usersService.updateUser(userId, validated, admin.id);
  }

  /**
   * POST /admin/users/:id/ban
   * Ban user
   */
  @Post(':id/ban')
  @Roles(Role.ADMIN)
  async banUser(
    @Param('id') userId: string,
    @Body() body: Record<string, unknown>,
    @CurrentUser() admin: { id: string }
  ): Promise<{ message: string }> {
    const validated = banUserSchema.parse(body);
    await this.usersService.banUser(userId, validated, admin.id);
    return { message: 'User banned successfully' };
  }

  /**
   * POST /admin/users/:id/unban
   * Unban user
   */
  @Post(':id/unban')
  @Roles(Role.ADMIN)
  async unbanUser(
    @Param('id') userId: string,
    @CurrentUser() admin: { id: string }
  ): Promise<{ message: string }> {
    await this.usersService.unbanUser(userId, admin.id);
    return { message: 'User unbanned successfully' };
  }

  /**
   * POST /admin/users/:id/suspend
   * Suspend user
   */
  @Post(':id/suspend')
  @Roles(Role.ADMIN)
  async suspendUser(
    @Param('id') userId: string,
    @Body() body: Record<string, unknown>,
    @CurrentUser() admin: { id: string }
  ): Promise<{ message: string }> {
    const validated = suspendUserSchema.parse(body);
    await this.usersService.suspendUser(userId, validated, admin.id);
    return { message: 'User suspended successfully' };
  }

  /**
   * POST /admin/users/:id/unsuspend
   * Unsuspend user
   */
  @Post(':id/unsuspend')
  @Roles(Role.ADMIN)
  async unsuspendUser(
    @Param('id') userId: string,
    @CurrentUser() admin: { id: string }
  ): Promise<{ message: string }> {
    await this.usersService.unsuspendUser(userId, admin.id);
    return { message: 'User unsuspended successfully' };
  }

  /**
   * POST /admin/users/:id/restore
   * Restore user (migrated from admin.controller.ts)
   */
  @Post(':id/restore')
  @Roles(Role.ADMIN)
  async restoreUser(
    @Param('id') userId: string,
    @CurrentUser() admin: { id: string }
  ): Promise<{ message: string }> {
    await this.usersService.restoreUser(userId, admin.id);
    return { message: 'User restored successfully' };
  }

  /**
   * POST /admin/users/bulk
   * Bulk action on users
   */
  @Post('bulk')
  @Roles(Role.ADMIN)
  async bulkAction(
    @Body() body: Record<string, unknown>,
    @CurrentUser() admin: { id: string }
  ): Promise<BulkActionResponseDto> {
    const validated = bulkActionSchema.parse(body);
    return this.usersService.bulkAction(validated, admin.id);
  }
}
