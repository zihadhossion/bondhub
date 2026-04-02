import { DataSource } from 'typeorm';
import { PostEntity } from '../../src/modules/posts/entities/post.entity';
import { CommentEntity } from '../../src/modules/comments/entities/comment.entity';

export async function createTestPost(
  ds: DataSource,
  authorId: string,
  communityId: string,
): Promise<PostEntity> {
  const repo = ds.getRepository(PostEntity);
  return repo.save(
    repo.create({
      title: 'Test Post Title',
      content: 'Test post content for E2E testing',
      authorId,
      communityId,
    }),
  );
}

export async function createTestComment(
  ds: DataSource,
  authorId: string,
  postId: string,
): Promise<CommentEntity> {
  const repo = ds.getRepository(CommentEntity);
  return repo.save(
    repo.create({
      content: 'Test comment content for E2E testing',
      authorId,
      postId,
    }),
  );
}
