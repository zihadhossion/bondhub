import 'reflect-metadata';
import 'dotenv/config';
import { join } from 'path';
import { DataSource } from 'typeorm';
import { UserEntity } from '../modules/users/entities/user.entity';
import { CategoryEntity } from '../modules/categories/entities/category.entity';
import { CommunityEntity } from '../modules/communities/entities/community.entity';
import { CommunityMemberEntity } from '../modules/communities/entities/community-member.entity';
import { PostEntity } from '../modules/posts/entities/post.entity';
import { CommentEntity } from '../modules/comments/entities/comment.entity';
import { FollowEntity } from '../modules/users/entities/follow.entity';
import { FlagEntity } from '../modules/flags/entities/flag.entity';
import { NotificationEntity } from '../modules/notifications/entities/notification.entity';
import { PostLikeEntity } from '../modules/posts/entities/post-like.entity';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

export const AppDataSource = new DataSource({
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
    NotificationEntity,
    PostLikeEntity,
  ],
  migrations: [join(__dirname, 'migrations', '*.{ts,js}')],
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
});
