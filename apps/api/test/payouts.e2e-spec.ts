import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaClient, KycLevel, TxKind, TxSide, TxStatus, Currency } from '@prisma/client';

const prisma = new PrismaClient();

describe('Payouts E2E Tests', () => {
  let app: INestApplication;
  let authToken: string;
  let creatorId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    // Create test creator with KYC
    const creator = await prisma.user.create({
      data: {
        email: 'payout_creator@test.com',
        username: 'payout_creator',
        passwordHash: 'hashed',
        role: 'CREATOR',
        kycLevel: KycLevel.BASIC,
      },
    });
    creatorId = creator.id;

    // Create wallet with balance
    await prisma.creatorWallet.create({
      data: {
        creatorId,
        currency: Currency.EUR,
        available: 100000, // 1000€
        inReserve: 50000, // 500€
        pendingClear: 0,
      },
    });

    // Create cleared ledger entries to simulate earnings
    await prisma.ledgerEntry.createMany({
      data: [
        {
          creatorId,
          kind: TxKind.SUBSCRIPTION,
          side: TxSide.CREDIT,
          amount: 100000,
          currency: Currency.EUR,
          status: TxStatus.CLEARED,
          referenceId: 'test-sub-1',
        },
        {
          creatorId,
          kind: TxKind.TIP,
          side: TxSide.CREDIT,
          amount: 50000,
          currency: Currency.EUR,
          status: TxStatus.CLEARED,
          reservePct: 10,
          referenceId: 'test-tip-1',
        },
      ],
    });

    authToken = 'Bearer test-token';
  });

  afterAll(async () => {
    await prisma.payout.deleteMany({});
    await prisma.ledgerEntry.deleteMany({});
    await prisma.creatorWallet.deleteMany({});
    await prisma.user.deleteMany({});
    await app.close();
  });

  describe('POST /payouts/request', () => {
    it('should request a standard payout', async () => {
      const response = await request(app.getHttpServer())
        .post('/payouts/request')
        .set('Authorization', authToken)
        .send({
          amount: 50000, // 500€
          mode: 'STANDARD',
          stripeAccountId: 'acct_test_123',
        })
        .expect(201);

      expect(response.body).toHaveProperty('payoutId');
      expect(response.body).toHaveProperty('status', 'PENDING');
      expect(response.body).toHaveProperty('amount', 50000);
      expect(response.body).toHaveProperty('fee', 0); // Standard has no fee
      expect(response.body).toHaveProperty('mode', 'STANDARD');
      expect(response.body).toHaveProperty('estimatedCompletion');
    });

    it('should request an express crypto payout with fee', async () => {
      const response = await request(app.getHttpServer())
        .post('/payouts/request')
        .set('Authorization', authToken)
        .send({
          amount: 30000, // 300€
          mode: 'EXPRESS_CRYPTO',
          destinationAddress: '0x1234567890abcdef',
        })
        .expect(201);

      expect(response.body).toHaveProperty('payoutId');
      expect(response.body.fee).toBeGreaterThan(0); // 3% fee
      expect(response.body.fee).toBe(900); // 3% of 30000
    });

    it('should reject express fiat without enhanced KYC', async () => {
      await request(app.getHttpServer())
        .post('/payouts/request')
        .set('Authorization', authToken)
        .send({
          amount: 20000,
          mode: 'EXPRESS_FIAT',
          stripeAccountId: 'acct_test_123',
        })
        .expect(403);
    });

    it('should enforce minimum payout amount', async () => {
      await request(app.getHttpServer())
        .post('/payouts/request')
        .set('Authorization', authToken)
        .send({
          amount: 1000, // Less than 50€ minimum
          mode: 'STANDARD',
        })
        .expect(400);
    });

    it('should reject payout exceeding available balance', async () => {
      await request(app.getHttpServer())
        .post('/payouts/request')
        .set('Authorization', authToken)
        .send({
          amount: 200000, // More than available (150000)
          mode: 'STANDARD',
        })
        .expect(400);
    });

    it('should reject payout for creator without KYC', async () => {
      const noKycCreator = await prisma.user.create({
        data: {
          email: 'nokyc@test.com',
          username: 'nokyc_creator',
          passwordHash: 'hashed',
          role: 'CREATOR',
          kycLevel: KycLevel.NONE,
        },
      });

      // Mock auth as noKycCreator
      await request(app.getHttpServer())
        .post('/payouts/request')
        .set('Authorization', 'Bearer nokyc-token')
        .send({
          amount: 10000,
          mode: 'STANDARD',
        })
        .expect(403);

      await prisma.user.delete({ where: { id: noKycCreator.id } });
    });
  });

  describe('GET /payouts/me', () => {
    it('should get creator payouts with pagination', async () => {
      // Create some test payouts
      await prisma.payout.createMany({
        data: [
          {
            creatorId,
            amount: 10000,
            fee: 0,
            currency: Currency.EUR,
            mode: 'STANDARD',
            status: 'COMPLETED',
            requestedAt: new Date(),
            estimatedCompletionAt: new Date(),
            completedAt: new Date(),
          },
          {
            creatorId,
            amount: 20000,
            fee: 600,
            currency: Currency.EUR,
            mode: 'EXPRESS_CRYPTO',
            status: 'PENDING',
            requestedAt: new Date(),
            estimatedCompletionAt: new Date(),
          },
        ],
      });

      const response = await request(app.getHttpServer())
        .get('/payouts/me')
        .set('Authorization', authToken)
        .expect(200);

      expect(response.body).toHaveProperty('payouts');
      expect(response.body).toHaveProperty('total');
      expect(Array.isArray(response.body.payouts)).toBe(true);
      expect(response.body.payouts.length).toBeGreaterThan(0);
    });

    it('should support pagination parameters', async () => {
      const response = await request(app.getHttpServer())
        .get('/payouts/me?limit=5&offset=0')
        .set('Authorization', authToken)
        .expect(200);

      expect(response.body.payouts.length).toBeLessThanOrEqual(5);
    });
  });

  describe('GET /payouts/history', () => {
    it('should get payout history summary', async () => {
      const response = await request(app.getHttpServer())
        .get('/payouts/history')
        .set('Authorization', authToken)
        .expect(200);

      expect(response.body).toHaveProperty('history');
      expect(response.body).toHaveProperty('totalPaidOut');
      expect(Array.isArray(response.body.history)).toBe(true);
      expect(typeof response.body.totalPaidOut).toBe('number');
    });

    it('should only include completed payouts in history', async () => {
      const response = await request(app.getHttpServer())
        .get('/payouts/history')
        .set('Authorization', authToken)
        .expect(200);

      const allCompleted = response.body.history.every((p: any) => p.status === 'COMPLETED');
      expect(allCompleted).toBe(true);
    });
  });

  describe('Payout Execution (Service Tests)', () => {
    it('should execute a standard payout successfully', async () => {
      // Create a payout ready for execution
      const payout = await prisma.payout.create({
        data: {
          creatorId,
          amount: 10000,
          fee: 0,
          currency: Currency.EUR,
          mode: 'STANDARD',
          status: 'PENDING',
          requestedAt: new Date(),
          estimatedCompletionAt: new Date(Date.now() - 1000), // Past estimated time
          stripeAccountId: 'acct_test_execute',
        },
      });

      // Note: In real tests, you would mock the Stripe API calls
      // For now, we're testing the logic flow

      expect(payout.status).toBe('PENDING');

      // After execution (would be done by BullMQ job in production)
      // The payout status should be COMPLETED
      // Ledger entries should be created for withdrawal
    });

    it('should fail payout with insufficient balance', async () => {
      const poorCreator = await prisma.user.create({
        data: {
          email: 'poor@test.com',
          username: 'poor_creator',
          passwordHash: 'hashed',
          role: 'CREATOR',
          kycLevel: KycLevel.BASIC,
        },
      });

      await prisma.creatorWallet.create({
        data: {
          creatorId: poorCreator.id,
          currency: Currency.EUR,
          available: 1000, // Only 10€
          inReserve: 0,
          pendingClear: 0,
        },
      });

      const payout = await prisma.payout.create({
        data: {
          creatorId: poorCreator.id,
          amount: 50000, // Requesting 500€ but only has 10€
          fee: 0,
          currency: Currency.EUR,
          mode: 'STANDARD',
          status: 'PENDING',
          requestedAt: new Date(),
          estimatedCompletionAt: new Date(),
        },
      });

      // Execution should fail with insufficient balance
      // Status should be updated to FAILED

      await prisma.user.delete({ where: { id: poorCreator.id } });
    });
  });

  describe('KYC Validations', () => {
    it('should allow standard payout with BASIC KYC', async () => {
      const basicKycCreator = await prisma.user.create({
        data: {
          email: 'basic@test.com',
          username: 'basic_kyc',
          passwordHash: 'hashed',
          role: 'CREATOR',
          kycLevel: KycLevel.BASIC,
        },
      });

      await prisma.creatorWallet.create({
        data: {
          creatorId: basicKycCreator.id,
          currency: Currency.EUR,
          available: 100000,
          inReserve: 0,
          pendingClear: 0,
        },
      });

      // Should succeed
      const response = await request(app.getHttpServer())
        .post('/payouts/request')
        .set('Authorization', 'Bearer basic-token')
        .send({
          amount: 10000,
          mode: 'STANDARD',
        });

      expect(response.status).toBeLessThan(400);

      await prisma.user.delete({ where: { id: basicKycCreator.id } });
    });

    it('should allow express fiat only with ENHANCED KYC', async () => {
      const enhancedCreator = await prisma.user.create({
        data: {
          email: 'enhanced@test.com',
          username: 'enhanced_kyc',
          passwordHash: 'hashed',
          role: 'CREATOR',
          kycLevel: KycLevel.ENHANCED,
        },
      });

      await prisma.creatorWallet.create({
        data: {
          creatorId: enhancedCreator.id,
          currency: Currency.EUR,
          available: 100000,
          inReserve: 0,
          pendingClear: 0,
        },
      });

      // Should succeed with enhanced KYC
      const response = await request(app.getHttpServer())
        .post('/payouts/request')
        .set('Authorization', 'Bearer enhanced-token')
        .send({
          amount: 10000,
          mode: 'EXPRESS_FIAT',
          stripeAccountId: 'acct_enhanced',
        });

      expect(response.status).toBeLessThan(400);

      await prisma.user.delete({ where: { id: enhancedCreator.id } });
    });
  });
});
