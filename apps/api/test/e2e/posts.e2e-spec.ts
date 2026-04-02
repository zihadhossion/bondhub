import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { createTestApp } from '../setup/test-app.factory';
import { generateAccessToken } from '../fixtures/auth.fixture';
import { getTestDataSource, cleanDatabase, closeDatabase } from '../setup/test-database';
import { seedTestUsers } from '../fixtures/user.fixture';
import { createTestCategory, createTestCommunity, addCommunityMember } from '../fixtures/community.fixture';
import { createTestPost } from '../fixtures/post.fixture';
import { UserEntity } from '../../src/modules/users/entities/user.entity';
import { CommunityEntity } from '../../src/modules/communities/entities/community.entity';
import { PostEntity } from '../../src/modules/posts/entities/post.entity';

describe('Posts (e2e)', () => {
  let app: INestApplication;
  let ds: DataSource;
  let user: UserEntity;
  let admin: UserEntity;
  let userToken: string;
  let adminToken: string;
  let community: CommunityEntity;
  let post: PostEntity;

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
    await addCommunityMember(ds, user.id, community.id);
    post = await createTestPost(ds, user.id, community.id);
  });

  afterAll(async () => {
    await app.close();
    await closeDatabase();
  });

  describe('GET /api/posts/feed', () => {
    it('should return personalized feed', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/posts/feed')
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 401 without auth', async () => {
      const res = await request(app.getHttpServer()).get('/api/posts/feed');
      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/posts', () => {
    it('should create a post as community member', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/posts')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          communityId: community.id,
          title: 'E2E Test Post',
          content: 'Content created during E2E testing',
        });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('should return 400 for missing required fields', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/posts')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ communityId: community.id });
      expect(res.status).toBe(400);
    });

    it('should return 401 without auth', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/posts')
        .send({ communityId: community.id, title: 'Test', content: 'Test' });
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/posts/:id', () => {
    it('should return post detail', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/posts/${post.id}`)
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 404 for non-existent post', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/posts/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(404);
    });

    it('should return 401 without auth', async () => {
      const res = await request(app.getHttpServer()).get(`/api/posts/${post.id}`);
      expect(res.status).toBe(401);
    });
  });

  describe('PATCH /api/posts/:id', () => {
    it('should update own post', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/posts/${post.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ title: 'Updated Title', content: 'Updated content' });
      expect(res.status).toBe(200);
    });

    it('should return 403 when non-owner tries to update', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/posts/${post.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ title: 'Unauthorized Update' });
      expect(res.status).toBe(403);
    });

    it('should return 401 without auth', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/posts/${post.id}`)
        .send({ title: 'No Auth' });
      expect(res.status).toBe(401);
    });
  });

  describe('DELETE /api/posts/:id', () => {
    it('should delete own post', async () => {
      const toDelete = await createTestPost(ds, user.id, community.id);
      const res = await request(app.getHttpServer())
        .delete(`/api/posts/${toDelete.id}`)
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(204);
    });

    it('should return 403 when non-owner tries to delete', async () => {
      const res = await request(app.getHttpServer())
        .delete(`/api/posts/${post.id}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(403);
    });

    it('should return 401 without auth', async () => {
      const res = await request(app.getHttpServer()).delete(`/api/posts/${post.id}`);
      expect(res.status).toBe(401);
    });
  });
});
