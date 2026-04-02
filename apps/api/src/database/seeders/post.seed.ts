import { DataSource } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import { PostEntity } from '../../modules/posts/entities/post.entity';
import { UserEntity } from '../../modules/users/entities/user.entity';
import { CommunityEntity } from '../../modules/communities/entities/community.entity';

interface PostFixture {
  title: string;
  content: string;
  author: string;
  community: string;
}

interface Fixtures {
  posts: PostFixture[];
}

export async function seedPosts(
  dataSource: DataSource,
  users: UserEntity[],
  communities: CommunityEntity[],
): Promise<PostEntity[]> {
  const repo = dataSource.getRepository(PostEntity);

  const fixturesPath = path.join(
    __dirname,
    '../../../../.claude-project/user_stories/_fixtures.yaml',
  );
  const fixturesContent = fs.readFileSync(fixturesPath, 'utf-8');
  const fixtures = yaml.load(fixturesContent) as Fixtures;

  const seeded: PostEntity[] = [];

  for (const fixture of fixtures.posts) {
    const existing = await repo.findOne({ where: { title: fixture.title } });
    if (existing) {
      console.log(`[post.seed] Skipping existing post: ${fixture.title}`);
      seeded.push(existing);
      continue;
    }

    const author = users.find((u) => u.email === fixture.author);
    const community = communities.find((c) => c.name === fixture.community);

    if (!author || !community) {
      console.warn(`[post.seed] Skipping post "${fixture.title}": author or community not found`);
      continue;
    }

    const post = repo.create({
      title: fixture.title,
      content: fixture.content,
      authorId: author.id,
      communityId: community.id,
    });
    const saved = await repo.save(post);
    console.log(`[post.seed] Created post: "${fixture.title}"`);
    seeded.push(saved);
  }

  return seeded;
}
