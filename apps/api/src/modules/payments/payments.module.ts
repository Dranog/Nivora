import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { PaymentsService } from './payments.service';
import { LedgerService } from './services/ledger.service';
import { WalletService } from './services/wallet.service';
import { PaymentsController } from './controllers/payments.controller';
import { WebhooksController } from './controllers/webhooks.controller';
import { ClearanceProcessor } from './processors/clearance.processor';
import { PaymentsScheduler } from './payments.scheduler';

@Module({
  imports: [
    ConfigModule,
    BullModule.registerQueue({ name: 'clearance' }, { name: 'payouts' }),
  ],
  providers: [
    PaymentsService,
    LedgerService,
    WalletService,
    ClearanceProcessor,
    PaymentsScheduler,
  ],
  controllers: [PaymentsController, WebhooksController],
  exports: [PaymentsService, LedgerService, WalletService],
})
export class PaymentsModule {}
