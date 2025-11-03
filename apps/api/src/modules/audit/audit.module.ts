// apps/api/src/modules/audit/audit.module.ts
import { Module } from '@nestjs/common';
import { AuditLogService } from './audit-log.service';
import { AuditLogController } from './audit-log.controller';
import { PrismaService } from '../../common/prisma/prisma.service';

@Module({
  controllers: [AuditLogController],
  providers: [
    AuditLogService,
    PrismaService,
    // ✅ Alias pour compatibilité (UsersService cherche "AuditService")
    {
      provide: 'AuditService',
      useExisting: AuditLogService,
    },
  ],
  exports: [
    AuditLogService,
    'AuditService', // ✅ Export de l'alias aussi
  ],
})
export class AuditModule {}
