import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PassportModule } from '@nestjs/passport';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { PostsModule } from './modules/posts/posts.module';
import { QueueModule } from './modules/queue/queue.module';
import { StorageModule } from './modules/storage/storage.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { PayoutsModule } from './modules/payouts/payouts.module';
import { CrmModule } from './modules/crm/crm.module';
import { ReactionsModule } from './modules/reactions/reactions.module';
import { TicketsModule } from './modules/tickets/tickets.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { PublicModule } from './modules/public/public.module';
import { AdminModule } from './modules/admin/admin.module';
import { HealthModule } from './modules/health/health.module';
import { MetricsModule } from './modules/metrics/metrics.module';
import { MessagesModule } from './modules/messages/messages.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { MarketplaceModule } from './modules/marketplace/marketplace.module';
import { BoostModule } from './modules/boost/boost.module';
import { SecurityModule } from './modules/security/security.module';
import { CorrelationIdMiddleware } from './common/middleware/correlation-id.middleware';
import { LoggingMiddleware } from './common/middleware/logging.middleware';
import { SecurityHeadersMiddleware } from './common/middleware/security-headers.middleware';
import { DomainCheckMiddleware } from './common/middleware/domain-check.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 5, // 5 requests per minute for /auth/*
      },
    ]),
    PassportModule,
    QueueModule,
    AuthModule,
    UsersModule,
    PostsModule,
    StorageModule,
    PaymentsModule,
    PayoutsModule,
    CrmModule,
    ReactionsModule,
    TicketsModule,
    AnalyticsModule,
    PublicModule,
    AdminModule,
    HealthModule,
    MetricsModule,
    MessagesModule,
    CategoriesModule,
    MarketplaceModule,
    BoostModule,
    SecurityModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(SecurityHeadersMiddleware, DomainCheckMiddleware, CorrelationIdMiddleware, LoggingMiddleware)
      .forRoutes('*');
  }
}
