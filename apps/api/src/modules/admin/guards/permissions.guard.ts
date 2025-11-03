// apps/api/src/modules/admin/guards/permissions.guard.ts

import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

const PERMISSIONS: Record<string, string[]> = {
  'users.read': ['ADMIN', 'MODERATOR', 'SENIOR_MODERATOR'],
  'users.write': ['ADMIN'],
  'users.suspend': ['ADMIN', 'SENIOR_MODERATOR'],
  'users.delete': ['ADMIN'],
  'kyc.view': ['ADMIN', 'MODERATOR', 'SENIOR_MODERATOR'],
  'kyc.approve': ['ADMIN', 'SENIOR_MODERATOR'],
  'settings.read': ['ADMIN'],
  'settings.write': ['ADMIN'],
  'reports.view': ['ADMIN', 'MODERATOR', 'SENIOR_MODERATOR'],
  'reports.moderate': ['ADMIN', 'MODERATOR', 'SENIOR_MODERATOR'],
  'transactions.view': ['ADMIN'],
  'accounting.export': ['ADMIN'],
};

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const permission = this.reflector.get<string>('permission', context.getHandler());

    if (!permission) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    const allowedRoles = PERMISSIONS[permission];

    if (!allowedRoles) {
      throw new ForbiddenException(`Unknown permission: ${permission}`);
    }

    if (!allowedRoles.includes(user.role)) {
      throw new ForbiddenException(`Insufficient permissions: ${permission} required`);
    }

    return true;
  }
}
