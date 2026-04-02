import { DataSource } from 'typeorm';
import { UserEntity } from '../../src/modules/users/entities/user.entity';
import { CategoryEntity } from '../../src/modules/categories/entities/category.entity';
import { CommunityEntity } from '../../src/modules/communities/entities/community.entity';
import { CommunityMemberEntity } from '../../src/modules/communities/entities/community-member.entity';
import { PostEntity } from '../../src/modules/posts/entities/post.entity';
import { CommentEntity } from '../../src/modules/comments/entities/comment.entity';
import { FollowEntity } from '../../src/modules/users/entities/follow.entity';
import { FlagEntity } from '../../src/modules/flags/entities/flag.entity';

let testDataSource: DataSource;

export async function getTestDataSource(): Promise<DataSource> {
  if (testDataSource?.isInitialized) return testDataSource;

  testDataSource = new DataSource({
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
    synchronize: true,
    logging: false,
  });

  await testDataSource.initialize();
  return testDataSource;
}

export async function cleanDatabase(ds: DataSource): Promise<void> {
  const tables = [
    'flags',
    'comments',
    'posts',
    'community_members',
    'follows',
    'communities',
    'categories',
    'users',
  ];

  for (const table of tables) {
    await ds.query(`DELETE FROM "${table}"`);
  }
}

export async function closeDatabase(): Promise<void> {
  if (testDataSource?.isInitialized) {
    await testDataSource.destroy();
  }
}
