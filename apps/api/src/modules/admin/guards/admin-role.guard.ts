// apps/api/src/modules/admin/guards/admin-role.guard.ts

import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

@Injectable()
export class AdminRoleGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    const adminRoles = ['ADMIN', 'MODERATOR', 'SENIOR_MODERATOR', 'SUPER_ADMIN'];

    if (!adminRoles.includes(user.role)) {
      throw new ForbiddenException('Access restricted to admin users only');
    }

    return true;
  }
}
