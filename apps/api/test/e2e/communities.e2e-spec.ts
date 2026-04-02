import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { createTestApp } from '../setup/test-app.factory';
import { generateAccessToken } from '../fixtures/auth.fixture';
import { getTestDataSource, cleanDatabase, closeDatabase } from '../setup/test-database';
import { seedTestUsers } from '../fixtures/user.fixture';
import { createTestCategory, createTestCommunity } from '../fixtures/community.fixture';
import { UserEntity } from '../../src/modules/users/entities/user.entity';
import { CommunityEntity } from '../../src/modules/communities/entities/community.entity';

describe('Communities (e2e)', () => {
  let app: INestApplication;
  let ds: DataSource;
  let user: UserEntity;
  let admin: UserEntity;
  let userToken: string;
  let adminToken: string;
  let community: CommunityEntity;

  beforeAll(async () => {
    app = await createTestApp();
    ds = await getTestDataSource();
    await cleanDatabase(ds);
    const seeded = await seedTestUsers(ds);
    user = seeded.user;
    admin = seeded.admin;
    userToken = generateAccessToken(user);
    adminToken = generateAccessToken(admin);

    const category = await createTestCategory(ds);
    community = await createTestCommunity(ds, category.id, admin.id);
  });

  afterAll(async () => {
    await app.close();
    await closeDatabase();
  });

  describe('GET /api/communities', () => {
    it('should return paginated communities list', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/communities')
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 401 without auth', async () => {
      const res = await request(app.getHttpServer()).get('/api/communities');
      expect(res.status).toBe(401);
    });

    it('should support search query', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/communities?q=Test')
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(200);
    });
  });

  describe('GET /api/communities/:id', () => {
    it('should return community detail', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/communities/${community.id}`)
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 404 for non-existent community', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/communities/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(404);
    });

    it('should return 401 without auth', async () => {
      const res = await request(app.getHttpServer()).get(`/api/communities/${community.id}`);
      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/communities/:id/join', () => {
    it('should allow user to join a community', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/communities/${community.id}/join`)
        .set('Authorization', `Bearer ${userToken}`);
      expect([200, 201]).toContain(res.status);
    });

    it('should return 409 when already a member', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/communities/${community.id}/join`)
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(409);
    });

    it('should return 401 without auth', async () => {
      const res = await request(app.getHttpServer()).post(`/api/communities/${community.id}/join`);
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/communities/:id/members', () => {
    it('should return community members', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/communities/${community.id}/members`)
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(200);
    });
  });

  describe('GET /api/communities/:id/posts', () => {
    it('should return community posts', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/communities/${community.id}/posts`)
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(200);
    });
  });

  describe('DELETE /api/communities/:id/join', () => {
    it('should allow user to leave a community', async () => {
      const res = await request(app.getHttpServer())
        .delete(`/api/communities/${community.id}/join`)
        .set('Authorization', `Bearer ${userToken}`);
      expect([200, 204]).toContain(res.status);
    });

    it('should return 401 without auth', async () => {
      const res = await request(app.getHttpServer()).delete(`/api/communities/${community.id}/join`);
      expect(res.status).toBe(401);
    });
  });
});
