import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PayoutsService } from '../payouts.service';

@Processor('payouts')
export class ExecutePayoutsProcessor extends WorkerHost {
  private readonly logger = new Logger(ExecutePayoutsProcessor.name);

  constructor(private readonly payoutsService: PayoutsService) {
    super();
  }

  async process(job: Job) {
    this.logger.log(`Processing execute-payouts job ${job.id}`);

    try {
      const pendingPayouts = await this.payoutsService.getPendingPayoutsForExecution();
      this.logger.log(`Found ${pendingPayouts.length} pending payouts to execute`);

      const results = {
        processed: 0,
        succeeded: 0,
        failed: 0,
      };

      for (const payout of pendingPayouts) {
        try {
          await this.payoutsService.executePayout(payout.id);
          results.succeeded++;
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : String(error);
          this.logger.error(`Failed to execute payout ${payout.id}: ${message}`);
          results.failed++;
        }
        results.processed++;
      }

      this.logger.log(
        `Execute-payouts job completed: Processed=${results.processed}, Succeeded=${results.succeeded}, Failed=${results.failed}`,
      );

      return results;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Execute-payouts job failed: ${message}`);
      throw error;
    }
  }
}
