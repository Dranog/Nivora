// apps/api/src/modules/admin/admin.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { RedisModule } from '@nestjs-modules/ioredis';

// Core Module
import { CoreModule } from './core/core.module';

// Sub-Modules
// import { FinanceModule } from './finance/finance.module'; // TEMPORARILY DISABLED - missing models (exportHistory, reconciliation, transaction)

// Shared services
import { IntegrationsModule } from '../integrations/integrations.module';
import { AuditModule } from '../audit/audit.module';
import { AuditModule as CommonAuditModule } from '../../common/audit/audit.module';

// Guards
import { AdminRoleGuard } from './guards/admin-role.guard';
import { PermissionsGuard } from './guards/permissions.guard';
// import { AdminLevelGuard } from './guards/admin-level.guard'; // TEMPORARILY DISABLED - missing 'admin' model

// Gateway
import { ModerationGateway } from './gateways/moderation.gateway';

// Controllers (root level only)
import { AdminController } from './admin.controller';
import { DashboardController } from './controllers/dashboard.controller';
import { UsersController } from './controllers/users.controller';
// import { TransactionsController } from './controllers/transactions.controller'; // TEMPORARILY DISABLED
// import { ModerationController } from './controllers/moderation.controller'; // TEMPORARILY DISABLED
// import { ReportsController } from './controllers/reports.controller'; // TEMPORARILY DISABLED

// Services (root level only)
import { AdminService } from './admin.service';
import { DashboardService } from './services/dashboard.service';
import { UsersService } from './services/users.service';
// import { TransactionsService } from './services/transactions.service'; // TEMPORARILY DISABLED - missing transaction model
// import { ModerationService } from './services/moderation.service'; // TEMPORARILY DISABLED - missing moderationDecision model
// import { ReportsService } from './services/reports.service'; // TEMPORARILY DISABLED - field name mismatches

// Prisma
import { PrismaService } from '../../common/prisma/prisma.service';

@Module({
  imports: [
    // Redis - ✅ Ajouté pour DashboardService
    RedisModule.forRoot({
      type: 'single',
      url: process.env.REDIS_URL || 'redis://localhost:6380',
    }),

    // Auth
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '7d' },
    }),

    // Core admin functionality
    CoreModule,

    // Sub-modules
    // FinanceModule, // TEMPORARILY DISABLED

    // Shared services
    IntegrationsModule,
    AuditModule, // For AuditLogService (UsersService)
    CommonAuditModule, // For AuditService (ModerationService)
  ],
  controllers: [
    AdminController,
    DashboardController,
    UsersController,
    // TransactionsController, // TEMPORARILY DISABLED
    // ModerationController, // TEMPORARILY DISABLED
    // ReportsController, // TEMPORARILY DISABLED
  ],
  providers: [
    // Services
    AdminService,
    DashboardService,
    UsersService,
    // TransactionsService, // TEMPORARILY DISABLED
    // ModerationService, // TEMPORARILY DISABLED
    // ReportsService, // TEMPORARILY DISABLED
    PrismaService,
    
    // Gateway
    ModerationGateway,
    
    // Global Guards
    AdminRoleGuard,
    PermissionsGuard,
    // AdminLevelGuard, // TEMPORARILY DISABLED
  ],
  exports: [
    CoreModule,
    // FinanceModule, // TEMPORARILY DISABLED
    UsersService,
    DashboardService,
  ],
})
export class AdminModule {}
