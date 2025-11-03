import { SetMetadata } from '@nestjs/common';
import { AdminLevel } from '@prisma/client';

export const ADMIN_LEVEL_KEY = 'adminLevel';

/**
 * Decorator to require specific admin levels for route access
 * @param levels - Array of AdminLevel enum values
 * @example @AdminLevel('SUPER_ADMIN', 'ADMIN_FULL')
 */
export const AdminLevelDecorator = (...levels: AdminLevel[]) =>
  SetMetadata(ADMIN_LEVEL_KEY, levels);
