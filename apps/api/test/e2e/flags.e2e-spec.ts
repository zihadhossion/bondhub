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
import { PostEntity } from '../../src/modules/posts/entities/post.entity';

describe('Flags (e2e)', () => {
  let app: INestApplication;
  let ds: DataSource;
  let user: UserEntity;
  let admin: UserEntity;
  let userToken: string;
  let adminToken: string;
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
    const community = await createTestCommunity(ds, category.id, admin.id);
    await addCommunityMember(ds, user.id, community.id);
    post = await createTestPost(ds, user.id, community.id);
  });

  afterAll(async () => {
    await app.close();
    await closeDatabase();
  });

  describe('POST /api/flags', () => {
    it('should submit a flag on a post', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/flags')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          contentType: 'post',
          contentId: post.id,
          reason: 'Spam content',
        });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('should return 400 for invalid contentType', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/flags')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          contentType: 'invalid_type',
          contentId: post.id,
        });
      expect(res.status).toBe(400);
    });

    it('should return 400 for missing required fields', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/flags')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ reason: 'Missing contentType and contentId' });
      expect(res.status).toBe(400);
    });

    it('should return 401 without auth', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/flags')
        .send({ contentType: 'post', contentId: post.id });
      expect(res.status).toBe(401);
    });
  });
});
