import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get('REDIS_HOST') || 'localhost',
          port: configService.get('REDIS_PORT') || 6380,
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue(
      { name: 'watermark' },
      { name: 'clearance' },
      { name: 'payouts' },
    ),
  ],
  exports: [BullModule],
})
export class QueueModule {}
