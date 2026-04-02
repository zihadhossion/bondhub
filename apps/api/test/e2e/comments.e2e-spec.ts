import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { createTestApp } from '../setup/test-app.factory';
import { generateAccessToken } from '../fixtures/auth.fixture';
import { getTestDataSource, cleanDatabase, closeDatabase } from '../setup/test-database';
import { seedTestUsers } from '../fixtures/user.fixture';
import { createTestCategory, createTestCommunity, addCommunityMember } from '../fixtures/community.fixture';
import { createTestPost, createTestComment } from '../fixtures/post.fixture';
import { UserEntity } from '../../src/modules/users/entities/user.entity';
import { PostEntity } from '../../src/modules/posts/entities/post.entity';
import { CommentEntity } from '../../src/modules/comments/entities/comment.entity';

describe('Comments (e2e)', () => {
  let app: INestApplication;
  let ds: DataSource;
  let user: UserEntity;
  let admin: UserEntity;
  let userToken: string;
  let adminToken: string;
  let post: PostEntity;
  let comment: CommentEntity;

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
    comment = await createTestComment(ds, user.id, post.id);
  });

  afterAll(async () => {
    await app.close();
    await closeDatabase();
  });

  describe('GET /api/posts/:postId/comments', () => {
    it('should return comments for a post', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/posts/${post.id}/comments`)
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 401 without auth', async () => {
      const res = await request(app.getHttpServer()).get(`/api/posts/${post.id}/comments`);
      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/posts/:postId/comments', () => {
    it('should create a comment on a post', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/posts/${post.id}/comments`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ content: 'This is a test comment from E2E' });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('should return 400 for empty content', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/posts/${post.id}/comments`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ content: '' });
      expect(res.status).toBe(400);
    });

    it('should return 401 without auth', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/posts/${post.id}/comments`)
        .send({ content: 'No auth comment' });
      expect(res.status).toBe(401);
    });
  });

  describe('DELETE /api/comments/:id', () => {
    it('should delete own comment', async () => {
      const toDelete = await createTestComment(ds, user.id, post.id);
      const res = await request(app.getHttpServer())
        .delete(`/api/comments/${toDelete.id}`)
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(204);
    });

    it('should return 403 when non-owner tries to delete', async () => {
      const res = await request(app.getHttpServer())
        .delete(`/api/comments/${comment.id}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(403);
    });

    it('should return 401 without auth', async () => {
      const res = await request(app.getHttpServer()).delete(`/api/comments/${comment.id}`);
      expect(res.status).toBe(401);
    });
  });
});
