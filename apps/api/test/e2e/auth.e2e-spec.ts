import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { createTestApp } from '../setup/test-app.factory';

describe('Auth (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: `e2e-register-${Date.now()}@test.com`,
          password: 'Test@1234',
          displayName: 'E2E User',
        });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('should return 400 for invalid email', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({ email: 'not-an-email', password: 'Test@1234', displayName: 'User' });
      expect(res.status).toBe(400);
    });

    it('should return 409 for duplicate email', async () => {
      const email = `dup-${Date.now()}@test.com`;
      await request(app.getHttpServer()).post('/api/auth/register')
        .send({ email, password: 'Test@1234', displayName: 'User' });
      const res = await request(app.getHttpServer()).post('/api/auth/register')
        .send({ email, password: 'Test@1234', displayName: 'User' });
      expect(res.status).toBe(409);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const email = `login-${Date.now()}@test.com`;
      await request(app.getHttpServer()).post('/api/auth/register')
        .send({ email, password: 'Test@1234', displayName: 'User' });

      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email, password: 'Test@1234' });
      expect(res.status).toBe(200);
      expect(res.headers['set-cookie']).toBeDefined();
    });

    it('should return 401 for wrong password', async () => {
      const email = `login-wp-${Date.now()}@test.com`;
      await request(app.getHttpServer()).post('/api/auth/register')
        .send({ email, password: 'Test@1234', displayName: 'User' });

      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email, password: 'WrongPass@1' });
      expect(res.status).toBe(401);
    });

    it('should return 401 for non-existent user', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'nonexistent@test.com', password: 'Test@1234' });
      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout successfully', async () => {
      const email = `logout-${Date.now()}@test.com`;
      await request(app.getHttpServer()).post('/api/auth/register')
        .send({ email, password: 'Test@1234', displayName: 'User' });
      const loginRes = await request(app.getHttpServer()).post('/api/auth/login')
        .send({ email, password: 'Test@1234' });
      const cookies = loginRes.headers['set-cookie'];

      const res = await request(app.getHttpServer())
        .post('/api/auth/logout')
        .set('Cookie', cookies);
      expect(res.status).toBe(200);
    });
  });

  describe('POST /api/auth/forgot-password', () => {
    it('should accept forgot-password request', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/forgot-password')
        .send({ email: 'any@test.com' });
      expect([200, 201]).toContain(res.status);
    });
  });
});
