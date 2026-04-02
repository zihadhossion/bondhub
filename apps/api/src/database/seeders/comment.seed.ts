import { DataSource } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import { CommentEntity } from '../../modules/comments/entities/comment.entity';
import { UserEntity } from '../../modules/users/entities/user.entity';
import { PostEntity } from '../../modules/posts/entities/post.entity';

interface CommentFixture {
  content: string;
  author: string;
  post: string;
}

interface Fixtures {
  comments: CommentFixture[];
}

export async function seedComments(
  dataSource: DataSource,
  users: UserEntity[],
  posts: PostEntity[],
): Promise<void> {
  const repo = dataSource.getRepository(CommentEntity);

  const fixturesPath = path.join(
    __dirname,
    '../../../../.claude-project/user_stories/_fixtures.yaml',
  );
  const fixturesContent = fs.readFileSync(fixturesPath, 'utf-8');
  const fixtures = yaml.load(fixturesContent) as Fixtures;

  for (const fixture of fixtures.comments) {
    const author = users.find((u) => u.email === fixture.author);
    const post = posts.find((p) => p.title === fixture.post);

    if (!author || !post) {
      console.warn(`[comment.seed] Skipping comment: author or post not found`);
      continue;
    }

    const existing = await repo.findOne({
      where: { content: fixture.content, authorId: author.id, postId: post.id },
    });
    if (existing) {
      console.log(`[comment.seed] Skipping existing comment by ${fixture.author}`);
      continue;
    }

    const comment = repo.create({
      content: fixture.content,
      authorId: author.id,
      postId: post.id,
    });
    await repo.save(comment);
    console.log(`[comment.seed] Created comment by ${fixture.author} on "${fixture.post}"`);
  }
}
