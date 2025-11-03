import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Payments E2E Tests', () => {
  let app: INestApplication;
  let authToken: string;
  let userId: string;
  let creatorId: string;
  let postId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    // Create test users
    const creator = await prisma.user.create({
      data: {
        email: 'creator@test.com',
        username: 'creator_test',
        passwordHash: 'hashed',
        role: 'CREATOR',
      },
    });
    creatorId = creator.id;

    const user = await prisma.user.create({
      data: {
        email: 'fan@test.com',
        username: 'fan_test',
        passwordHash: 'hashed',
        role: 'FAN',
      },
    });
    userId = user.id;

    // Create a test post
    const post = await prisma.post.create({
      data: {
        authorId: creatorId,
        content: 'Test PPV post',
        isPPV: true,
        price: 1000,
      },
    });
    postId = post.id;

    // Get auth token (mock for testing)
    authToken = 'Bearer test-token';
  });

  afterAll(async () => {
    // Cleanup
    await prisma.ledgerEntry.deleteMany({});
    await prisma.tip.deleteMany({});
    await prisma.purchase.deleteMany({});
    await prisma.subscription.deleteMany({});
    await prisma.post.deleteMany({});
    await prisma.user.deleteMany({});
    await app.close();
  });

  describe('POST /payments/subscriptions', () => {
    it('should create a subscription with Stripe', async () => {
      const response = await request(app.getHttpServer())
        .post('/payments/subscriptions')
        .set('Authorization', authToken)
        .send({
          creatorId,
          paymentMethod: 'STRIPE',
        })
        .expect(201);

      expect(response.body).toHaveProperty('subscriptionId');
      expect(response.body).toHaveProperty('status', 'PENDING');
      expect(response.body).toHaveProperty('paymentUrl');
    });

    it('should fail with invalid payment method', async () => {
      await request(app.getHttpServer())
        .post('/payments/subscriptions')
        .set('Authorization', authToken)
        .send({
          creatorId,
          paymentMethod: 'INVALID',
        })
        .expect(400);
    });

    it('should fail with non-existent creator', async () => {
      await request(app.getHttpServer())
        .post('/payments/subscriptions')
        .set('Authorization', authToken)
        .send({
          creatorId: 'non-existent-id',
          paymentMethod: 'STRIPE',
        })
        .expect(404);
    });
  });

  describe('POST /payments/purchases', () => {
    it('should create a PPV purchase', async () => {
      const response = await request(app.getHttpServer())
        .post('/payments/purchases')
        .set('Authorization', authToken)
        .send({
          postId,
          amount: 1000,
          paymentMethod: 'STRIPE',
        })
        .expect(201);

      expect(response.body).toHaveProperty('purchaseId');
      expect(response.body).toHaveProperty('status', 'PENDING');
      expect(response.body).toHaveProperty('paymentUrl');
    });

    it('should fail with non-PPV post', async () => {
      const freePost = await prisma.post.create({
        data: {
          authorId: creatorId,
          content: 'Free post',
          isPPV: false,
        },
      });

      await request(app.getHttpServer())
        .post('/payments/purchases')
        .set('Authorization', authToken)
        .send({
          postId: freePost.id,
          amount: 1000,
          paymentMethod: 'STRIPE',
        })
        .expect(400);

      await prisma.post.delete({ where: { id: freePost.id } });
    });

    it('should validate minimum amount', async () => {
      await request(app.getHttpServer())
        .post('/payments/purchases')
        .set('Authorization', authToken)
        .send({
          postId,
          amount: 0,
          paymentMethod: 'STRIPE',
        })
        .expect(400);
    });
  });

  describe('POST /payments/tips', () => {
    it('should create a tip', async () => {
      const response = await request(app.getHttpServer())
        .post('/payments/tips')
        .set('Authorization', authToken)
        .send({
          creatorId,
          amount: 500,
          message: 'Great content!',
          paymentMethod: 'STRIPE',
        })
        .expect(201);

      expect(response.body).toHaveProperty('tipId');
      expect(response.body).toHaveProperty('status', 'PENDING');
    });

    it('should enforce minimum tip amount (1€ = 100 cents)', async () => {
      await request(app.getHttpServer())
        .post('/payments/tips')
        .set('Authorization', authToken)
        .send({
          creatorId,
          amount: 50, // Less than 100 cents
          paymentMethod: 'STRIPE',
        })
        .expect(400);
    });

    it('should allow tips without message', async () => {
      const response = await request(app.getHttpServer())
        .post('/payments/tips')
        .set('Authorization', authToken)
        .send({
          creatorId,
          amount: 1000,
          paymentMethod: 'STRIPE',
        })
        .expect(201);

      expect(response.body).toHaveProperty('tipId');
    });

    it('should validate message length', async () => {
      await request(app.getHttpServer())
        .post('/payments/tips')
        .set('Authorization', authToken)
        .send({
          creatorId,
          amount: 1000,
          message: 'a'.repeat(501), // Max 500 chars
          paymentMethod: 'STRIPE',
        })
        .expect(400);
    });
  });

  describe('GET /payments/wallet', () => {
    it('should get wallet balance', async () => {
      const response = await request(app.getHttpServer())
        .get('/payments/wallet')
        .set('Authorization', authToken)
        .expect(200);

      expect(response.body).toHaveProperty('wallet');
      expect(response.body).toHaveProperty('balance');
      expect(response.body.balance).toHaveProperty('available');
      expect(response.body.balance).toHaveProperty('inReserve');
      expect(response.body.balance).toHaveProperty('pendingClear');
      expect(response.body).toHaveProperty('upcomingReleases');
    });
  });
});
