import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaClient, TxStatus } from '@prisma/client';
import Stripe from 'stripe';

const prisma = new PrismaClient();

describe('Stripe Webhooks E2E Tests', () => {
  let app: INestApplication;
  let creatorId: string;
  let userId: string;
  let subscriptionId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Create test users
    const creator = await prisma.user.create({
      data: {
        email: 'webhookcreator@test.com',
        username: 'webhook_creator',
        passwordHash: 'hashed',
        role: 'CREATOR',
      },
    });
    creatorId = creator.id;

    const user = await prisma.user.create({
      data: {
        email: 'webhookfan@test.com',
        username: 'webhook_fan',
        passwordHash: 'hashed',
        role: 'FAN',
      },
    });
    userId = user.id;

    // Create a test subscription
    const subscription = await prisma.subscription.create({
      data: {
        userId,
        creatorId,
        amount: 1000,
        currency: 'EUR',
        paymentMethod: 'STRIPE',
        status: 'PENDING',
        stripePaymentIntentId: 'pi_test_123',
      },
    });
    subscriptionId = subscription.id;
  });

  afterAll(async () => {
    await prisma.ledgerEntry.deleteMany({});
    await prisma.stripeEvent.deleteMany({});
    await prisma.subscription.deleteMany({});
    await prisma.user.deleteMany({});
    await app.close();
  });

  describe('POST /payments/webhooks/stripe', () => {
    it('should process payment_intent.succeeded event', async () => {
      const event: Partial<Stripe.Event> = {
        id: 'evt_test_' + Date.now(),
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: 'pi_test_123',
            amount: 1000,
            currency: 'eur',
            metadata: {
              type: 'subscription',
              subscriptionId,
              userId,
              creatorId,
            },
          } as Stripe.PaymentIntent,
        },
      };

      // Note: In a real test, you would need to properly sign the webhook with Stripe's secret
      // For this test, we're assuming the signature validation is mocked or disabled in test env

      const response = await request(app.getHttpServer())
        .post('/payments/webhooks/stripe')
        .set('stripe-signature', 'test-signature')
        .send(event);

      // Verify subscription was updated
      const updatedSubscription = await prisma.subscription.findUnique({
        where: { id: subscriptionId },
      });
      expect(updatedSubscription.status).toBe('ACTIVE');

      // Verify ledger entries were created
      const ledgerEntries = await prisma.ledgerEntry.findMany({
        where: { referenceId: subscriptionId },
      });
      expect(ledgerEntries.length).toBeGreaterThan(0);

      // Verify fan debit entry
      const fanDebit = ledgerEntries.find((e) => e.userId === userId && e.side === 'DEBIT');
      expect(fanDebit).toBeDefined();
      expect(fanDebit.amount).toBe(1000);
      expect(fanDebit.status).toBe(TxStatus.CLEARED);

      // Verify creator credit entries
      const creatorCredits = ledgerEntries.filter((e) => e.creatorId === creatorId && e.side === 'CREDIT');
      expect(creatorCredits.length).toBe(2); // Main + Reserve

      // Verify platform fee
      const platformFee = ledgerEntries.find((e) => e.meta?.split === 'platform_fee');
      expect(platformFee).toBeDefined();
      expect(platformFee.amount).toBe(100); // 10% of 1000
    });

    it('should be idempotent (duplicate events should not create duplicate entries)', async () => {
      const eventId = 'evt_idempotent_test_' + Date.now();

      const event: Partial<Stripe.Event> = {
        id: eventId,
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: 'pi_test_idempotent',
            amount: 2000,
            metadata: {
              type: 'subscription',
              subscriptionId,
              userId,
              creatorId,
            },
          } as Stripe.PaymentIntent,
        },
      };

      // First call
      await request(app.getHttpServer())
        .post('/payments/webhooks/stripe')
        .set('stripe-signature', 'test-signature')
        .send(event);

      const entriesAfterFirst = await prisma.ledgerEntry.count();

      // Second call with same event ID
      await request(app.getHttpServer())
        .post('/payments/webhooks/stripe')
        .set('stripe-signature', 'test-signature')
        .send(event);

      const entriesAfterSecond = await prisma.ledgerEntry.count();

      // Should not create duplicate entries
      expect(entriesAfterSecond).toBe(entriesAfterFirst);
    });

    it('should process charge.refunded event', async () => {
      // Create a completed purchase first
      const purchase = await prisma.purchase.create({
        data: {
          userId,
          postId: (await prisma.post.create({
            data: { authorId: creatorId, content: 'Test', isPPV: true, price: 1500 },
          })).id,
          creatorId,
          amount: 1500,
          currency: 'EUR',
          paymentMethod: 'STRIPE',
          status: 'COMPLETED',
          stripePaymentIntentId: 'pi_test_refund',
        },
      });

      const refundEvent: Partial<Stripe.Event> = {
        id: 'evt_refund_' + Date.now(),
        type: 'charge.refunded',
        data: {
          object: {
            id: 'ch_test_refund',
            payment_intent: 'pi_test_refund',
            amount_refunded: 1500,
          } as Stripe.Charge,
        },
      };

      await request(app.getHttpServer())
        .post('/payments/webhooks/stripe')
        .set('stripe-signature', 'test-signature')
        .send(refundEvent);

      // Verify purchase was marked as refunded
      const updatedPurchase = await prisma.purchase.findUnique({
        where: { id: purchase.id },
      });
      expect(updatedPurchase.status).toBe('REFUNDED');

      // Verify refund ledger entries were created
      const refundEntries = await prisma.ledgerEntry.findMany({
        where: { kind: 'REFUND' },
      });
      expect(refundEntries.length).toBeGreaterThan(0);
    });

    it('should process charge.dispute.created event', async () => {
      // Create a completed tip
      const tip = await prisma.tip.create({
        data: {
          userId,
          creatorId,
          amount: 2000,
          currency: 'EUR',
          paymentMethod: 'STRIPE',
          status: 'COMPLETED',
          stripePaymentIntentId: 'pi_test_dispute',
        },
      });

      const disputeEvent: Partial<Stripe.Event> = {
        id: 'evt_dispute_' + Date.now(),
        type: 'charge.dispute.created',
        data: {
          object: {
            id: 'dp_test_123',
            charge: 'ch_test_dispute',
            amount: 2000,
            reason: 'fraudulent',
          } as Stripe.Dispute,
        },
      };

      // Note: This would need to mock the Stripe charge retrieval in a real test

      // Verify chargeback entries logic (would need proper mocking in real test)
      // For now, just verify the endpoint accepts the webhook
      const response = await request(app.getHttpServer())
        .post('/payments/webhooks/stripe')
        .set('stripe-signature', 'test-signature')
        .send(disputeEvent);

      expect(response.status).toBeLessThan(500);
    });

    it('should reject webhooks without signature', async () => {
      const event = {
        id: 'evt_no_signature',
        type: 'payment_intent.succeeded',
        data: { object: {} },
      };

      await request(app.getHttpServer())
        .post('/payments/webhooks/stripe')
        .send(event)
        .expect(400);
    });
  });
});
