import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { CacheModule } from '@nestjs/cache-manager';
import { MessagesController } from './messages.controller';
import { MessagesService } from './messages.service';
import { MessagesGateway } from './messages.gateway';
import { PresenceService } from './presence.service';
import { PrismaModule } from '../../common/prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'change-me-in-production',
      signOptions: { expiresIn: '15m' },
    }),
    CacheModule.register({
      ttl: 60, // 60 seconds default TTL
      max: 1000, // Maximum items in cache
    }),
  ],
  controllers: [MessagesController],
  providers: [MessagesService, MessagesGateway, PresenceService],
  exports: [MessagesService, MessagesGateway, PresenceService],
})
export class MessagesModule {}
