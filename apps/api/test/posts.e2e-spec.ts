import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

describe('Posts E2E Tests', () => {
  let app: INestApplication;
  let creatorToken: string;
  let creatorId: string;
  let fanToken: string;
  let fanId: string;
  let mediaId: string;
  let freePostId: string;
  let paidPostId: string;

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

    // Clean up database
    await prisma.post.deleteMany();
    await prisma.media.deleteMany();
    await prisma.purchase.deleteMany();
    await prisma.session.deleteMany();
    await prisma.creatorProfile.deleteMany();
    await prisma.user.deleteMany();

    // Create creator
    const creatorRes = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        email: 'creator@posts.com',
        password: 'password123',
        role: Role.CREATOR,
      });
    creatorToken = creatorRes.body.accessToken;
    creatorId = creatorRes.body.user.id;

    // Create fan
    const fanRes = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        email: 'fan@posts.com',
        password: 'password123',
        role: Role.FAN,
      });
    fanToken = fanRes.body.accessToken;
    fanId = fanRes.body.user.id;

    // Create a media for testing
    const media = await prisma.media.create({
      data: {
        ownerId: creatorId,
        objectKey: 'test-media-key',
        contentType: 'image/jpeg',
        bytes: 1024,
        status: 'READY',
        purpose: 'POST',
      },
    });
    mediaId = media.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  describe('POST /api/posts', () => {
    it('should create a free post as creator', () => {
      return request(app.getHttpServer())
        .post('/api/posts')
        .set('Authorization', `Bearer ${creatorToken}`)
        .send({
          caption: 'This is a free post',
          isPaid: false,
          mediaIds: [mediaId],
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.caption).toBe('This is a free post');
          expect(res.body.isPaid).toBe(false);
          expect(res.body.status).toBe('PUBLISHED');
          freePostId = res.body.id;
        });
    });

    it('should create a paid post as creator', async () => {
      // Create another media for paid post
      const paidMedia = await prisma.media.create({
        data: {
          ownerId: creatorId,
          objectKey: 'paid-media-key',
          contentType: 'video/mp4',
          bytes: 2048,
          status: 'READY',
          purpose: 'PAID',
        },
      });

      return request(app.getHttpServer())
        .post('/api/posts')
        .set('Authorization', `Bearer ${creatorToken}`)
        .send({
          caption: 'This is a paid post',
          isPaid: true,
          price: 1000, // 10 EUR in cents
          mediaIds: [paidMedia.id],
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.isPaid).toBe(true);
          expect(res.body.price).toBe(1000);
          paidPostId = res.body.id;
        });
    });

    it('should reject post with invalid mediaIds', () => {
      return request(app.getHttpServer())
        .post('/api/posts')
        .set('Authorization', `Bearer ${creatorToken}`)
        .send({
          caption: 'Invalid media',
          isPaid: false,
          mediaIds: ['invalid-media-id'],
        })
        .expect(400);
    });

    it('should reject paid post without price', () => {
      return request(app.getHttpServer())
        .post('/api/posts')
        .set('Authorization', `Bearer ${creatorToken}`)
        .send({
          caption: 'Paid post without price',
          isPaid: true,
          mediaIds: [],
        })
        .expect(400);
    });
  });

  describe('GET /api/posts/:id', () => {
    it('should get free post without auth', () => {
      return request(app.getHttpServer())
        .get(`/api/posts/${freePostId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(freePostId);
          expect(res.body.isPaid).toBe(false);
        });
    });

    it('should get paid post teaser without auth', () => {
      return request(app.getHttpServer())
        .get(`/api/posts/${paidPostId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(paidPostId);
          expect(res.body.isPaid).toBe(true);
          expect(res.body.isTeaser).toBe(true);
          expect(res.body.media.length).toBeLessThanOrEqual(2);
        });
    });

    it('should get full paid post as creator', () => {
      return request(app.getHttpServer())
        .get(`/api/posts/${paidPostId}`)
        .set('Authorization', `Bearer ${creatorToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(paidPostId);
          expect(res.body.isPaid).toBe(true);
          expect(res.body.isTeaser).toBeUndefined();
        });
    });

    it('should get full paid post after purchase', async () => {
      // Create purchase
      await prisma.purchase.create({
        data: {
          fanId,
          postId: paidPostId,
          amount: 1000,
          currency: 'EUR',
          status: 'PAID',
        },
      });

      return request(app.getHttpServer())
        .get(`/api/posts/${paidPostId}`)
        .set('Authorization', `Bearer ${fanToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(paidPostId);
          expect(res.body.isPaid).toBe(true);
          expect(res.body.isTeaser).toBeUndefined();
        });
    });
  });

  describe('GET /api/creators/:creatorId/posts', () => {
    it('should get all posts by creator', () => {
      return request(app.getHttpServer())
        .get(`/api/creators/${creatorId}/posts`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('posts');
          expect(res.body).toHaveProperty('total');
          expect(res.body.posts.length).toBeGreaterThan(0);
        });
    });

    it('should filter posts by isPaid', () => {
      return request(app.getHttpServer())
        .get(`/api/creators/${creatorId}/posts?isPaid=true`)
        .expect(200)
        .expect((res) => {
          expect(res.body.posts.every((p: any) => p.isPaid === true)).toBe(
            true,
          );
        });
    });

    it('should paginate posts', () => {
      return request(app.getHttpServer())
        .get(`/api/creators/${creatorId}/posts?page=1&limit=1`)
        .expect(200)
        .expect((res) => {
          expect(res.body.posts.length).toBe(1);
          expect(res.body.page).toBe(1);
          expect(res.body.limit).toBe(1);
        });
    });
  });

  describe('PATCH /api/posts/:id', () => {
    it('should update post as owner', () => {
      return request(app.getHttpServer())
        .patch(`/api/posts/${freePostId}`)
        .set('Authorization', `Bearer ${creatorToken}`)
        .send({
          caption: 'Updated caption',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.caption).toBe('Updated caption');
        });
    });

    it('should reject update by non-owner', () => {
      return request(app.getHttpServer())
        .patch(`/api/posts/${freePostId}`)
        .set('Authorization', `Bearer ${fanToken}`)
        .send({
          caption: 'Hacked caption',
        })
        .expect(403);
    });
  });

  describe('DELETE /api/posts/:id', () => {
    it('should delete post as owner', () => {
      return request(app.getHttpServer())
        .delete(`/api/posts/${freePostId}`)
        .set('Authorization', `Bearer ${creatorToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
        });
    });

    it('should reject delete by non-owner', () => {
      return request(app.getHttpServer())
        .delete(`/api/posts/${paidPostId}`)
        .set('Authorization', `Bearer ${fanToken}`)
        .expect(403);
    });
  });
});
