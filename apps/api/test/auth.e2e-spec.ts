import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Auth E2E Tests', () => {
  let app: INestApplication;
  let accessToken: string;
  let refreshToken: string;

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

    // Clean up database before tests
    await prisma.session.deleteMany();
    await prisma.creatorProfile.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  describe('/api/auth/register (POST)', () => {
    it('should register a new FAN user', () => {
      return request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: 'fan@example.com',
          password: 'password123',
          role: 'FAN',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('accessToken');
          expect(res.body).toHaveProperty('refreshToken');
          expect(res.body).toHaveProperty('user');
          expect(res.body.user.email).toBe('fan@example.com');
          expect(res.body.user.role).toBe('FAN');
        });
    });

    it('should register a new CREATOR user with profile', () => {
      return request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: 'creator@example.com',
          password: 'password123',
          role: 'CREATOR',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('accessToken');
          expect(res.body).toHaveProperty('refreshToken');
          expect(res.body.user.role).toBe('CREATOR');
          expect(res.body.user).toHaveProperty('creatorProfile');
          expect(res.body.user.creatorProfile).toHaveProperty('username');
        });
    });

    it('should reject duplicate email', () => {
      return request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: 'fan@example.com',
          password: 'password123',
          role: 'FAN',
        })
        .expect(409);
    });
  });

  describe('/api/auth/login (POST)', () => {
    it('should login with valid credentials', () => {
      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'fan@example.com',
          password: 'password123',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('accessToken');
          expect(res.body).toHaveProperty('refreshToken');
          accessToken = res.body.accessToken;
          refreshToken = res.body.refreshToken;
        });
    });

    it('should reject invalid password', () => {
      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'fan@example.com',
          password: 'wrongpassword',
        })
        .expect(401);
    });

    it('should reject non-existent user', () => {
      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123',
        })
        .expect(401);
    });
  });

  describe('/api/users/me (GET)', () => {
    it('should get user profile with valid token', () => {
      return request(app.getHttpServer())
        .get('/api/users/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.email).toBe('fan@example.com');
        });
    });

    it('should reject request without token', () => {
      return request(app.getHttpServer()).get('/api/users/me').expect(401);
    });
  });

  describe('/api/auth/refresh (POST)', () => {
    it('should refresh tokens with valid refresh token', () => {
      return request(app.getHttpServer())
        .post('/api/auth/refresh')
        .send({
          refreshToken,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('accessToken');
          expect(res.body).toHaveProperty('refreshToken');
          accessToken = res.body.accessToken;
        });
    });
  });

  describe('/api/auth/logout (POST)', () => {
    it('should logout successfully', () => {
      return request(app.getHttpServer())
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(201)
        .expect((res) => {
          expect(res.body.success).toBe(true);
        });
    });
  });
});
