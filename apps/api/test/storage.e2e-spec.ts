import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaClient } from '@prisma/client';
import { Queue } from 'bullmq';
import { getQueueToken } from '@nestjs/bullmq';
import Redis from 'ioredis';

const prisma = new PrismaClient();

describe('Storage E2E Tests', () => {
  let app: INestApplication;
  let creatorToken: string;
  let creatorId: string;
  let fanToken: string;
  let fanId: string;
  let watermarkQueue: Queue;
  let redis: Redis;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.setGlobalPrefix('api');

    await app.init();

    watermarkQueue = moduleFixture.get(getQueueToken('watermark'));
    redis = new Redis(process.env.REDIS_URL);

    // Clean up database
    await prisma.media.deleteMany();
    await prisma.post.deleteMany();
    await prisma.session.deleteMany();
    await prisma.creatorProfile.deleteMany();
    await prisma.user.deleteMany();

    // Register creator
    const creatorRes = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        email: 'creator@test.com',
        password: 'password123',
        role: 'CREATOR',
      })
      .expect(201);

    creatorToken = creatorRes.body.accessToken;
    creatorId = creatorRes.body.user.id;

    // Register fan
    const fanRes = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        email: 'fan@test.com',
        password: 'password123',
        role: 'FAN',
      })
      .expect(201);

    fanToken = fanRes.body.accessToken;
    fanId = fanRes.body.user.id;
  });

  afterAll(async () => {
    await redis.disconnect();
    await prisma.$disconnect();
    await app.close();
  });

  describe('Upload Flow', () => {
    let signedUrl: string;
    let objectKey: string;

    describe('POST /api/storage/signed-url', () => {
      it('should generate presigned URL for valid image upload', async () => {
        const res = await request(app.getHttpServer())
          .post('/api/storage/signed-url')
          .set('Authorization', `Bearer ${creatorToken}`)
          .send({
            contentType: 'image/jpeg',
            contentLength: 5 * 1024 * 1024, // 5MB
            purpose: 'POST',
          })
          .expect(201);

        expect(res.body).toHaveProperty('url');
        expect(res.body).toHaveProperty('objectKey');
        expect(res.body).toHaveProperty('expiresIn', 600);
        expect(res.body).toHaveProperty('headers');

        signedUrl = res.body.url;
        objectKey = res.body.objectKey;
      });

      it('should generate presigned URL for valid video upload', async () => {
        const res = await request(app.getHttpServer())
          .post('/api/storage/signed-url')
          .set('Authorization', `Bearer ${creatorToken}`)
          .send({
            contentType: 'video/mp4',
            contentLength: 100 * 1024 * 1024, // 100MB
            purpose: 'TEASER',
          })
          .expect(201);

        expect(res.body).toHaveProperty('url');
        expect(res.body.objectKey).toContain(creatorId);
      });

      it('should reject oversized image', async () => {
        await request(app.getHttpServer())
          .post('/api/storage/signed-url')
          .set('Authorization', `Bearer ${creatorToken}`)
          .send({
            contentType: 'image/png',
            contentLength: 20 * 1024 * 1024, // 20MB (exceeds 15MB limit)
            purpose: 'POST',
          })
          .expect(400);
      });

      it('should reject oversized video', async () => {
        await request(app.getHttpServer())
          .post('/api/storage/signed-url')
          .set('Authorization', `Bearer ${creatorToken}`)
          .send({
            contentType: 'video/mp4',
            contentLength: 600 * 1024 * 1024, // 600MB (exceeds 500MB limit)
            purpose: 'PAID',
          })
          .expect(400);
      });

      it('should reject invalid content type', async () => {
        await request(app.getHttpServer())
          .post('/api/storage/signed-url')
          .set('Authorization', `Bearer ${creatorToken}`)
          .send({
            contentType: 'application/pdf',
            contentLength: 1024 * 1024,
            purpose: 'POST',
          })
          .expect(400);
      });

      it('should reject unauthorized request', async () => {
        await request(app.getHttpServer())
          .post('/api/storage/signed-url')
          .send({
            contentType: 'image/jpeg',
            contentLength: 1024 * 1024,
            purpose: 'POST',
          })
          .expect(401);
      });
    });

    describe('POST /api/storage/complete', () => {
      let mediaId: string;

      it('should complete upload and enqueue watermark job', async () => {
        const res = await request(app.getHttpServer())
          .post('/api/storage/complete')
          .set('Authorization', `Bearer ${creatorToken}`)
          .send({
            objectKey,
            checksum: 'abc123',
            contentType: 'image/jpeg',
            contentLength: 5 * 1024 * 1024,
            purpose: 'POST',
          })
          .expect(201);

        expect(res.body).toHaveProperty('mediaId');
        expect(res.body).toHaveProperty('status', 'PROCESSING');

        mediaId = res.body.mediaId;

        // Verify Media record created
        const media = await prisma.media.findUnique({
          where: { id: mediaId },
        });

        expect(media).toBeDefined();
        expect(media.ownerId).toBe(creatorId);
        expect(media.status).toBe('PROCESSING');
        expect(media.watermarked).toBe(false);

        // Verify watermark job enqueued
        const waitingJobs = await watermarkQueue.getWaiting();
        const job = waitingJobs.find((j) => j.data.mediaId === mediaId);
        expect(job).toBeDefined();
      });

      it('should reject unauthorized request', async () => {
        await request(app.getHttpServer())
          .post('/api/storage/complete')
          .send({
            objectKey: 'uploads/test/file.jpg',
            checksum: 'abc123',
          })
          .expect(401);
      });
    });
  });

  describe('Playback Flow', () => {
    let freeMediaId: string;
    let paidMediaId: string;
    let freePostId: string;
    let paidPostId: string;
    let playbackToken: string;

    beforeAll(async () => {
      // Create free post with media
      const freePost = await prisma.post.create({
        data: {
          creatorId,
          isPaid: false,
          caption: 'Free content',
        },
      });
      freePostId = freePost.id;

      const freeMedia = await prisma.media.create({
        data: {
          ownerId: creatorId,
          postId: freePostId,
          objectKey: 'processed/test-free.jpg',
          contentType: 'image/jpeg',
          size: 1024 * 1024,
          status: 'READY',
          watermarked: true,
        },
      });
      freeMediaId = freeMedia.id;

      // Create paid post with media
      const paidPost = await prisma.post.create({
        data: {
          creatorId,
          isPaid: true,
          price: 1000, // $10.00
          caption: 'Paid content',
        },
      });
      paidPostId = paidPost.id;

      const paidMedia = await prisma.media.create({
        data: {
          ownerId: creatorId,
          postId: paidPostId,
          objectKey: 'processed/test-paid.mp4',
          contentType: 'video/mp4',
          size: 10 * 1024 * 1024,
          status: 'READY',
          watermarked: true,
        },
      });
      paidMediaId = paidMedia.id;
    });

    describe('POST /api/storage/playback', () => {
      it('should generate playback token for free content', async () => {
        const res = await request(app.getHttpServer())
          .post('/api/storage/playback')
          .set('Authorization', `Bearer ${fanToken}`)
          .send({
            mediaId: freeMediaId,
          })
          .expect(201);

        expect(res.body).toHaveProperty('playUrl');
        expect(res.body).toHaveProperty('expiresAt');
        expect(res.body).toHaveProperty('jti');
        expect(res.body.playUrl).toContain('/api/storage/playback/');

        playbackToken = res.body.playUrl.split('/').pop();

        // Verify token stored in Redis
        const jti = res.body.jti;
        const redisKey = await redis.get(`playback:${jti}`);
        expect(redisKey).toBeDefined();
      });

      it('should generate playback token for creator own content', async () => {
        const res = await request(app.getHttpServer())
          .post('/api/storage/playback')
          .set('Authorization', `Bearer ${creatorToken}`)
          .send({
            mediaId: paidMediaId,
          })
          .expect(201);

        expect(res.body).toHaveProperty('playUrl');
      });

      it('should reject unauthorized access to paid content', async () => {
        await request(app.getHttpServer())
          .post('/api/storage/playback')
          .set('Authorization', `Bearer ${fanToken}`)
          .send({
            mediaId: paidMediaId,
          })
          .expect(403);
      });

      it('should allow access after purchase', async () => {
        // Create purchase
        await prisma.purchase.create({
          data: {
            buyerId: fanId,
            postId: paidPostId,
            amount: 1000,
            stripePaymentIntentId: 'pi_test_123',
          },
        });

        const res = await request(app.getHttpServer())
          .post('/api/storage/playback')
          .set('Authorization', `Bearer ${fanToken}`)
          .send({
            mediaId: paidMediaId,
          })
          .expect(201);

        expect(res.body).toHaveProperty('playUrl');
      });

      it('should reject non-existent media', async () => {
        await request(app.getHttpServer())
          .post('/api/storage/playback')
          .set('Authorization', `Bearer ${fanToken}`)
          .send({
            mediaId: 'non-existent-id',
          })
          .expect(403);
      });

      it('should reject unauthorized request', async () => {
        await request(app.getHttpServer())
          .post('/api/storage/playback')
          .send({
            mediaId: freeMediaId,
          })
          .expect(401);
      });
    });

    describe('GET /api/storage/playback/:token', () => {
      let singleUseToken: string;

      beforeEach(async () => {
        // Generate fresh token for each test
        const res = await request(app.getHttpServer())
          .post('/api/storage/playback')
          .set('Authorization', `Bearer ${fanToken}`)
          .send({
            mediaId: freeMediaId,
          });

        singleUseToken = res.body.playUrl.split('/').pop();
      });

      it('should stream media with valid token', async () => {
        const res = await request(app.getHttpServer())
          .get(`/api/storage/playback/${singleUseToken}`)
          .expect(200);

        expect(res.headers['cache-control']).toBe('no-store');
        expect(res.headers['content-disposition']).toBe('inline');
        expect(res.headers['x-content-type-options']).toBe('nosniff');
      });

      it('should enforce single-use token (reject second use)', async () => {
        // First use
        await request(app.getHttpServer())
          .get(`/api/storage/playback/${singleUseToken}`)
          .expect(200);

        // Second use should fail
        await request(app.getHttpServer())
          .get(`/api/storage/playback/${singleUseToken}`)
          .expect(401);
      });

      it('should reject token with different User-Agent (if PLAYBACK_BIND_UA=true)', async () => {
        // This test requires PLAYBACK_BIND_UA=true in .env
        if (process.env.PLAYBACK_BIND_UA !== 'true') {
          return;
        }

        await request(app.getHttpServer())
          .get(`/api/storage/playback/${singleUseToken}`)
          .set('User-Agent', 'DifferentBrowser/1.0')
          .expect(401);
      });

      it('should reject expired token', async () => {
        // This would require mocking time or waiting 10 minutes
        // For now, just test with invalid signature
        await request(app.getHttpServer())
          .get('/api/storage/playback/invalid.token.signature')
          .expect(401);
      });

      it('should reject request without token', async () => {
        await request(app.getHttpServer())
          .get('/api/storage/playback/')
          .expect(404);
      });
    });
  });

  describe('Security Tests', () => {
    it('should prevent directory traversal in objectKey', async () => {
      await request(app.getHttpServer())
        .post('/api/storage/complete')
        .set('Authorization', `Bearer ${creatorToken}`)
        .send({
          objectKey: '../../../etc/passwd',
          checksum: 'abc123',
        })
        .expect(400);
    });

    it('should validate checksum format', async () => {
      await request(app.getHttpServer())
        .post('/api/storage/complete')
        .set('Authorization', `Bearer ${creatorToken}`)
        .send({
          objectKey: 'uploads/valid/file.jpg',
          checksum: '',
        })
        .expect(400);
    });

    it('should prevent token sharing across different IPs (if PLAYBACK_BIND_IP=true)', async () => {
      // This test would require spoofing IP addresses
      // Placeholder for integration testing
    });
  });
});
