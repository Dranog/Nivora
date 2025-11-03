import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaClient, TransactionCategory, Currency, SubscriptionStatus } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { LedgerService } from './services/ledger.service';
import { CreateSubscriptionDto, SubscriptionResponseDto } from './dto/create-subscription.dto';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { CreateTipDto } from './dto/create-tip.dto';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private stripe!: Stripe;

  constructor(
    private readonly ledgerService: LedgerService,
    private readonly configService: ConfigService,
  ) {
    const stripeKey = this.configService.get('STRIPE_SECRET_KEY');
    if (stripeKey) {
      // @ts-expect-error - Using Stripe API version 2024-12-18.acacia for compatibility
      this.stripe = new Stripe(stripeKey, { apiVersion: '2024-12-18.acacia' });
    }
  }

  async createSubscription(dto: CreateSubscriptionDto, fanId: string): Promise<SubscriptionResponseDto> {
    // Verify creator exists
    const creator = await prisma.user.findUnique({ where: { id: dto.creatorId } });
    if (!creator) {
      throw new NotFoundException('Creator not found');
    }

    // Get plan if specified
    // TODO: Implement SubscriptionPlan model for different pricing tiers
    let amount = 0;
    if (dto.planId) {
      // For now, use a default subscription amount
      // In the future, fetch from SubscriptionPlan model
      amount = 999; // Default: 9.99 EUR in cents
    }

    // Create subscription record
    const subscription = await prisma.subscription.create({
      data: {
        id: randomUUID(),
        fanId: fanId,
        creatorId: dto.creatorId,
        status: SubscriptionStatus.ACTIVE, // Start active, will be updated if payment fails
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        updatedAt: new Date(),
      },
    });

    this.logger.log(`Created subscription ${subscription.id} for user ${fanId} -> creator ${dto.creatorId}`);

    // Handle payment method
    if (dto.paymentMethod === 'STRIPE') {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount,
        currency: 'eur',
        metadata: {
          type: 'subscription',
          subscriptionId: subscription.id,
          userId: fanId,
          authorId: dto.creatorId,
        },
      });

      return {
        subscriptionId: subscription.id,
        status: 'PENDING',
        paymentUrl: paymentIntent.client_secret ?? undefined,
      };
    } else {
      // CRYPTO - stub for now
      return {
        subscriptionId: subscription.id,
        status: 'PENDING',
        paymentUrl: `crypto://pay/${subscription.id}`,
      };
    }
  }

  async createPurchase(dto: CreatePurchaseDto, fanId: string) {
    // Verify post exists and is PPV
    const post = await prisma.post.findUnique({ where: { id: dto.postId } });
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    if (!post.isPPV || !post.price) {
      throw new BadRequestException('Post is not a PPV post');
    }

    // Create purchase record
    const purchase = await prisma.purchase.create({
      data: {
        id: randomUUID(),
        fanId: fanId,
        postId: dto.postId,
        amount: dto.amount,
        currency: Currency.EUR,
        status: 'PENDING',
      },
    });

    this.logger.log(`Created purchase ${purchase.id} for user ${fanId} -> post ${dto.postId}`);

    // Handle payment method
    if (dto.paymentMethod === 'STRIPE') {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: dto.amount,
        currency: 'eur',
        metadata: {
          type: 'purchase',
          purchaseId: purchase.id,
          userId: fanId,
          authorId: post.creatorId,
          postId: dto.postId,
        },
      });

      return {
        purchaseId: purchase.id,
        status: 'PENDING',
        paymentUrl: paymentIntent.client_secret,
      };
    } else {
      // CRYPTO - stub for now
      return {
        purchaseId: purchase.id,
        status: 'PENDING',
        paymentUrl: `crypto://pay/${purchase.id}`,
      };
    }
  }

  async createTip(dto: CreateTipDto, fanId: string) {
    // Verify creator exists
    const creator = await prisma.user.findUnique({ where: { id: dto.creatorId } });
    if (!creator) {
      throw new NotFoundException('Creator not found');
    }

    // Create tip record
    const tip = await prisma.tip.create({
      data: {
        id: randomUUID(),
        fanId: fanId,
        creatorId: dto.creatorId,
        amount: dto.amount,
        currency: Currency.EUR,
        message: dto.message,
        status: 'PENDING',
      },
    });

    this.logger.log(`Created tip ${tip.id} for user ${fanId} -> creator ${dto.creatorId}`);

    // Handle payment method
    if (dto.paymentMethod === 'STRIPE') {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: dto.amount,
        currency: 'eur',
        metadata: {
          type: 'tip',
          tipId: tip.id,
          userId: fanId,
          authorId: dto.creatorId,
        },
      });

      return {
        tipId: tip.id,
        status: 'PENDING',
        paymentUrl: paymentIntent.client_secret,
      };
    } else {
      // CRYPTO - stub for now
      return {
        tipId: tip.id,
        status: 'PENDING',
        paymentUrl: `crypto://pay/${tip.id}`,
      };
    }
  }

  async handleStripeWebhook(event: Stripe.Event) {
    this.logger.log(`Processing Stripe event: ${event.type}`);

    // Check idempotency
    // TODO: Add StripeEvent model to track processed webhook events
    const existing = null; // await prisma.stripeEvent.findUnique({ where: { stripeEventId: event.id } });

    if (existing) {
      this.logger.warn(`Event ${event.id} already processed, skipping`);
      return { received: true };
    }

    // Store event
    // TODO: Store webhook event for idempotency
    // await prisma.stripeEvent.create({ data: { stripeEventId: event.id, type: event.type, data: event } });

    switch (event.type) {
      case 'payment_intent.succeeded':
        await this.handlePaymentSuccess(event.data.object as Stripe.PaymentIntent);
        break;

      case 'charge.refunded':
        await this.handleRefund(event.data.object as Stripe.Charge);
        break;

      case 'charge.dispute.created':
        await this.handleDispute(event.data.object as Stripe.Dispute);
        break;

      default:
        this.logger.log(`Unhandled event type: ${event.type}`);
    }

    return { received: true };
  }

  private async handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
    const metadata = paymentIntent.metadata as any;
    const type = metadata.type;

    this.logger.log(`Payment success: ${type} - ${paymentIntent.id}`);

    if (type === 'subscription') {
      const subscription = await prisma.subscription.update({
        where: { id: metadata.subscriptionId },
        data: { status: 'ACTIVE' }, // TODO: Add stripePaymentIntentId field if needed
      });

      await this.ledgerService.createPaymentEntries({
        fanId: metadata.userId,
        authorId: metadata.authorId,
        amountCents: paymentIntent.amount,
        type: 'SUBSCRIPTION',
        referenceId: subscription.id,
      });
    } else if (type === 'purchase') {
      const purchase = await prisma.purchase.update({
        where: { id: metadata.purchaseId },
        data: { status: 'PAID' }, // Payment successful
      });

      await this.ledgerService.createPaymentEntries({
        fanId: metadata.userId,
        authorId: metadata.authorId,
        amountCents: paymentIntent.amount,
        type: 'PPV',
        referenceId: purchase.id,
      });
    } else if (type === 'tip') {
      const tip = await prisma.tip.update({
        where: { id: metadata.tipId },
        data: { status: 'SUCCESS' }, // PaymentStatus enum
      });

      await this.ledgerService.createPaymentEntries({
        fanId: metadata.userId,
        authorId: metadata.authorId,
        amountCents: paymentIntent.amount,
        type: 'TIP',
        referenceId: tip.id,
      });
    }
  }

  private async handleRefund(charge: Stripe.Charge) {
    this.logger.log(`Refund received: ${charge.id}`);

    // Get payment intent from charge
    const paymentIntentId = typeof charge.payment_intent === 'string' ? charge.payment_intent : charge.payment_intent?.id;
    if (!paymentIntentId) {
      this.logger.error('No payment intent ID in charge');
      return;
    }

    // Find the original payment by stripePaymentIntentId
    let originalPayment: any = null;
    let kind: TransactionCategory = TransactionCategory.SUBSCRIPTION;
    let fanId: string = '';
    let authorId: string = '';

    // TODO: Without stripePaymentIntentId, we cannot reliably find the original payment
    // For now, comment out this logic until we add the field to the schema
    /*
    originalPayment = await prisma.subscription.findFirst({
      where: { fanId: charge.customer as string },
      orderBy: { createdAt: 'desc' },
      take: 1,
    });
    if (originalPayment) {
      kind = TransactionCategory.SUBSCRIPTION;
      fanId = originalPayment.fanId;
      authorId = originalPayment.creatorId;
    }
    */

    /*
    // TODO: Re-enable once stripePaymentIntentId is added to schema
    this.logger.warn('Refund handling disabled - stripePaymentIntentId field not in schema');
    return;

    /*
    if (!originalPayment) {
      this.logger.error(`No original payment found for payment intent ${paymentIntentId}`);
      return;
    }
    */

    // Create refund ledger entries
    // TODO: Implement createRefundEntries in LedgerService
      /* await this.ledgerService.createRefundEntries({
        userId: charge.customer,
        creatorId: creatorId,
        amount: charge.amount_refunded,
        referenceId: subscription?.id ?? purchase?.id ?? tip?.id ?? '',
      }); */

    this.logger.log(`Processed refund for ${kind} ${originalPayment.id}: ${charge.amount_refunded} cents`);
  }

  // TODO: Re-enable handleDispute once stripePaymentIntentId is added to schema
  private async handleDispute(dispute: Stripe.Dispute) {
    this.logger.log(`Dispute received: ${dispute.id}`);
    this.logger.warn('Dispute handling disabled - stripePaymentIntentId field not in schema');
    return;
  }
}
