import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { StorageService } from './storage.service';
import { StorageController } from './storage.controller';
import { WatermarkService } from './watermark.service';
import { WatermarkProcessor } from './watermark.processor';
import { PlaybackService } from './playback.service';
import { SignedUrlGuard } from './guards/signed-url.guard';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET') || 'default-secret',
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue({
      name: 'watermark',
    }),
  ],
  controllers: [StorageController],
  providers: [
    StorageService,
    WatermarkService,
    WatermarkProcessor,
    PlaybackService,
    SignedUrlGuard,
  ],
  exports: [StorageService, PlaybackService],
})
export class StorageModule {}
