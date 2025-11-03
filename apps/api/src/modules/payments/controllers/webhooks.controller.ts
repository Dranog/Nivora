import { Controller, Post, Headers, Req, BadRequestException, Logger } from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import Stripe from 'stripe';
import { PaymentsService } from '../payments.service';

@Controller('payments/webhooks')
export class WebhooksController {
  private readonly logger = new Logger(WebhooksController.name);
  private stripe!: Stripe;
  private webhookSecret: string;

  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly configService: ConfigService,
  ) {
    const stripeKey = this.configService.get('STRIPE_SECRET_KEY');
    this.webhookSecret = this.configService.get('STRIPE_WEBHOOK_SECRET') || '';

    if (stripeKey) {
      // @ts-expect-error - Using Stripe API version 2024-12-18.acacia for compatibility
      this.stripe = new Stripe(stripeKey, { apiVersion: '2024-12-18.acacia' });
    }
  }

  @Post('stripe')
  async handleStripeWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() request: RawBodyRequest<Request>,
  ) {
    if (!signature) {
      throw new BadRequestException('Missing stripe-signature header');
    }

    const rawBody = request.rawBody;
    if (!rawBody) {
      throw new BadRequestException('Missing raw body');
    }

    let event: Stripe.Event;

    try {
      // Verify webhook signature
      event = this.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        this.webhookSecret,
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(`Webhook signature verification failed: ${message}`);
      throw new BadRequestException(`Webhook Error: ${message}`);
    }

    this.logger.log(`Received verified webhook: ${event.type}`);

    // Process the event
    return await this.paymentsService.handleStripeWebhook(event);
  }
}
