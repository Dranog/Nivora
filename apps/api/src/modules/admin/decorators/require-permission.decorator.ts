// apps/api/src/modules/admin/decorators/require-permission.decorator.ts

import { SetMetadata } from '@nestjs/common';

export const RequirePermission = (permission: string) => SetMetadata('permission', permission);
