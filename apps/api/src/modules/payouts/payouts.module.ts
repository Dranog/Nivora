import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { PayoutsController } from './payouts.controller';
import { PayoutsService } from './payouts.service';
import { PaymentsModule } from '../payments/payments.module';
import { ExecutePayoutsProcessor } from './processors/execute-payouts.processor';

@Module({
  imports: [
    ConfigModule,
    PaymentsModule,
    BullModule.registerQueue({ name: 'payouts' }),
  ],
  controllers: [PayoutsController],
  providers: [PayoutsService, ExecutePayoutsProcessor],
  exports: [PayoutsService],
})
export class PayoutsModule {}
