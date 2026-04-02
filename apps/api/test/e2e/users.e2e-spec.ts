import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { createTestApp } from '../setup/test-app.factory';
import { generateAccessToken } from '../fixtures/auth.fixture';
import { getTestDataSource, cleanDatabase, closeDatabase } from '../setup/test-database';
import { seedTestUsers } from '../fixtures/user.fixture';
import { UserEntity } from '../../src/modules/users/entities/user.entity';

describe('Users (e2e)', () => {
  let app: INestApplication;
  let ds: DataSource;
  let user: UserEntity;
  let admin: UserEntity;
  let userToken: string;
  let adminToken: string;

  beforeAll(async () => {
    app = await createTestApp();
    ds = await getTestDataSource();
    await cleanDatabase(ds);
    const seeded = await seedTestUsers(ds);
    user = seeded.user;
    admin = seeded.admin;
    userToken = generateAccessToken(user);
    adminToken = generateAccessToken(admin);
  });

  afterAll(async () => {
    await app.close();
    await closeDatabase();
  });

  describe('GET /api/users/me', () => {
    it('should return current user profile', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/users/me')
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe(user.email);
    });

    it('should return 401 without auth', async () => {
      const res = await request(app.getHttpServer()).get('/api/users/me');
      expect(res.status).toBe(401);
    });
  });

  describe('PATCH /api/users/me', () => {
    it('should update current user profile', async () => {
      const res = await request(app.getHttpServer())
        .patch('/api/users/me')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ displayName: 'Updated Name', bio: 'Updated bio' });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 401 without auth', async () => {
      const res = await request(app.getHttpServer())
        .patch('/api/users/me')
        .send({ displayName: 'No Auth' });
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/users/:id', () => {
    it('should return user public profile', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/users/${admin.id}`)
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 404 for non-existent user', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/users/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(404);
    });

    it('should return 401 without auth', async () => {
      const res = await request(app.getHttpServer()).get(`/api/users/${admin.id}`);
      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/users/:id/follow', () => {
    it('should follow a user', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/users/${admin.id}/follow`)
        .set('Authorization', `Bearer ${userToken}`);
      expect([200, 201]).toContain(res.status);
    });

    it('should return 401 without auth', async () => {
      const res = await request(app.getHttpServer()).post(`/api/users/${admin.id}/follow`);
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/users/:id/followers', () => {
    it('should return followers list', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/users/${admin.id}/followers`)
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(200);
    });

    it('should return 401 without auth', async () => {
      const res = await request(app.getHttpServer()).get(`/api/users/${admin.id}/followers`);
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/users/:id/following', () => {
    it('should return following list', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/users/${user.id}/following`)
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(200);
    });
  });

  describe('DELETE /api/users/:id/follow', () => {
    it('should unfollow a user', async () => {
      const res = await request(app.getHttpServer())
        .delete(`/api/users/${admin.id}/follow`)
        .set('Authorization', `Bearer ${userToken}`);
      expect([200, 204]).toContain(res.status);
    });
  });
});
