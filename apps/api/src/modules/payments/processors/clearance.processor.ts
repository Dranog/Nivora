import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { LedgerService } from '../services/ledger.service';

@Processor('clearance')
export class ClearanceProcessor extends WorkerHost {
  private readonly logger = new Logger(ClearanceProcessor.name);

  constructor(private readonly ledgerService: LedgerService) {
    super();
  }

  async process(job: Job) {
    this.logger.log(`Processing clearance job ${job.id}`);

    try {
      // const result = await this.ledgerService.clearPendingEntries(); // TODO: Implement
      const result = { cleared: 0 }; // Stub
      return result;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Clearance job failed: ${message}`);
      throw error;
    }
  }
}
