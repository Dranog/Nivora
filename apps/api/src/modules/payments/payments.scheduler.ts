import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class PaymentsScheduler {
  private readonly logger = new Logger(PaymentsScheduler.name);

  constructor(
    @InjectQueue('clearance') private clearanceQueue: Queue,
    @InjectQueue('payouts') private payoutsQueue: Queue,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async scheduleClearanceJob() {
    this.logger.log('Scheduling clearance job');
    await this.clearanceQueue.add('clear-pending-entries', {}, { removeOnComplete: true });
  }

  @Cron(CronExpression.EVERY_HOUR)
  async schedulePayoutsJob() {
    this.logger.log('Scheduling execute-payouts job');
    await this.payoutsQueue.add('execute-pending-payouts', {}, { removeOnComplete: true });
  }
}
