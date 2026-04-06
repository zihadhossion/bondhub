import 'reflect-metadata';
import * as bcrypt from 'bcrypt';
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
import { NotificationEntity } from '../../modules/notifications/entities/notification.entity';
import { PostLikeEntity } from '../../modules/posts/entities/post-like.entity';
import { RoleEnum } from '../../shared/enums/role.enum';
import { UserStatusEnum } from '../../shared/enums/user-status.enum';

dotenv.config({ path: path.join(__dirname, '../../../.env') });

if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
  throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD environment variables are required');
}

const ADMIN_EMAIL = process.env.ADMIN_EMAIL as string;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD as string;
const ADMIN_DISPLAY_NAME = process.env.ADMIN_DISPLAY_NAME ?? 'Admin';

const AppDataSource = new DataSource({
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
  synchronize: false,
  logging: false,
});

async function runSeeders() {
  await AppDataSource.initialize();

  const repo = AppDataSource.getRepository(UserEntity);
  const existing = await repo.findOne({ where: { email: ADMIN_EMAIL } });

  if (existing) {
    console.log(`[seed] Admin already exists: ${ADMIN_EMAIL}`);
  } else {
    const hash = await bcrypt.hash(ADMIN_PASSWORD, 10);
    const admin = repo.create({
      email: ADMIN_EMAIL,
      password: hash,
      displayName: ADMIN_DISPLAY_NAME,
      bio: null,
      profilePicture: null,
      role: RoleEnum.admin,
      status: UserStatusEnum.active,
    });
    await repo.save(admin);
    console.log(`[seed] Admin created: ${ADMIN_EMAIL}`);
  }

  await AppDataSource.destroy();
}

runSeeders().catch((err) => {
  console.error(err);
  process.exit(1);
});
