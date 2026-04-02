import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { createTestApp } from '../setup/test-app.factory';
import { generateAccessToken } from '../fixtures/auth.fixture';
import { getTestDataSource, cleanDatabase, closeDatabase } from '../setup/test-database';
import { seedTestUsers } from '../fixtures/user.fixture';
import { DataSource } from 'typeorm';

describe('Categories (e2e)', () => {
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

  describe('GET /api/categories', () => {
    it('should return categories list', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/categories')
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should return 401 without auth', async () => {
      const res = await request(app.getHttpServer()).get('/api/categories');
      expect(res.status).toBe(401);
    });
  });
});
