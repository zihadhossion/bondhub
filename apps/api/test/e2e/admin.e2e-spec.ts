import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { createTestApp } from '../setup/test-app.factory';
import { generateAccessToken } from '../fixtures/auth.fixture';
import { getTestDataSource, cleanDatabase, closeDatabase } from '../setup/test-database';
import { seedTestUsers } from '../fixtures/user.fixture';
import { DataSource } from 'typeorm';

describe('Admin (e2e)', () => {
  let app: INestApplication;
  let ds: DataSource;
  let userToken: string;
  let adminToken: string;

  beforeAll(async () => {
    app = await createTestApp();
    ds = await getTestDataSource();
    await cleanDatabase(ds);
    const { user, admin } = await seedTestUsers(ds);
    userToken = generateAccessToken(user);
    adminToken = generateAccessToken(admin);
  });

  afterAll(async () => {
    await app.close();
    await closeDatabase();
  });

  describe('GET /api/admin/dashboard/stats', () => {
    it('should return stats for admin', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/admin/dashboard/stats')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 403 for regular user', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/admin/dashboard/stats')
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(403);
    });

    it('should return 401 without auth', async () => {
      const res = await request(app.getHttpServer()).get('/api/admin/dashboard/stats');
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/admin/users', () => {
    it('should list users for admin', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data).toBeDefined();
      expect(res.body.meta).toBeDefined();
    });

    it('should return 403 for non-admin', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(403);
    });
  });

  describe('POST /api/admin/users', () => {
    it('should create user as admin', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          email: `admin-created-${Date.now()}@test.com`,
          password: 'Created@1',
          displayName: 'Admin Created',
        });
      expect(res.status).toBe(201);
    });

    it('should return 400 for missing fields', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ email: 'missing@test.com' });
      expect(res.status).toBe(400);
    });
  });
});
