import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { PaymentsService } from './payments.service';
import { LedgerService } from './services/ledger.service';
import { WalletService } from './services/wallet.service';
import { CCBillService } from './services/ccbill.service';
import { PaymentsController } from './controllers/payments.controller';
import { WebhooksController } from './controllers/webhooks.controller';
import { StripeController } from './controllers/stripe.controller';
import { CCBillController } from './controllers/ccbill.controller';
import { ClearanceProcessor } from './processors/clearance.processor';
import { PaymentsScheduler } from './payments.scheduler';
import { PostsModule } from '../posts/posts.module';

@Module({
  imports: [
    ConfigModule,
    BullModule.registerQueue({ name: 'clearance' }, { name: 'payouts' }),
    PostsModule,
  ],
  providers: [
    PaymentsService,
    LedgerService,
    WalletService,
    CCBillService,
    ClearanceProcessor,
    PaymentsScheduler,
  ],
  controllers: [PaymentsController, WebhooksController, StripeController, CCBillController],
  exports: [PaymentsService, LedgerService, WalletService, CCBillService],
})
export class PaymentsModule {}
