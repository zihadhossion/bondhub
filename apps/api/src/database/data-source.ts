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

if (!process.env.DB_HOST) {
  throw new Error('DB_HOST environment variable is required');
}

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
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
