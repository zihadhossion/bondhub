import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { UserEntity } from '../../modules/users/entities/user.entity';
import { CategoryEntity } from '../../modules/categories/entities/category.entity';
import { CommunityEntity } from '../../modules/communities/entities/community.entity';
import { CommunityMemberEntity } from '../../modules/communities/entities/community-member.entity';
import { PostEntity } from '../../modules/posts/entities/post.entity';
import { CommentEntity } from '../../modules/comments/entities/comment.entity';
import { FollowEntity } from '../../modules/users/entities/follow.entity';
import { FlagEntity } from '../../modules/flags/entities/flag.entity';
import { seedUsers } from './user.seed';
import { seedCategories } from './category.seed';
import { seedCommunities } from './community.seed';
import { seedPosts } from './post.seed';
import { seedComments } from './comment.seed';

dotenv.config({ path: path.join(__dirname, '../../../.env') });

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [
    UserEntity,
    CategoryEntity,
    CommunityEntity,
    CommunityMemberEntity,
    PostEntity,
    CommentEntity,
    FollowEntity,
    FlagEntity,
  ],
  synchronize: false,
  logging: false,
});

async function runSeeders() {
  console.log('[seed] Connecting to database...');
  await AppDataSource.initialize();
  console.log('[seed] Connected.');

  try {
    // Dependency order: users → categories → communities → posts → comments
    const users = await seedUsers(AppDataSource);
    const categories = await seedCategories(AppDataSource);
    const communities = await seedCommunities(AppDataSource, users, categories);
    const posts = await seedPosts(AppDataSource, users, communities);
    await seedComments(AppDataSource, users, posts);

    console.log('[seed] All seeders completed successfully.');
  } catch (error) {
    console.error('[seed] Seeder failed:', error);
    throw error;
  } finally {
    await AppDataSource.destroy();
    console.log('[seed] Database connection closed.');
  }
}

runSeeders().catch((err) => {
  console.error(err);
  process.exit(1);
});
