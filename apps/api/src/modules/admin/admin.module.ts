import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminService } from './admin.service';
import { AdminDashboardController } from './controllers/admin-dashboard.controller';
import { AdminUsersController } from './controllers/admin-users.controller';
import { AdminCommunitiesController } from './controllers/admin-communities.controller';
import { AdminCategoriesController } from './controllers/admin-categories.controller';
import { AdminPostsController } from './controllers/admin-posts.controller';
import { AdminCommentsController } from './controllers/admin-comments.controller';
import { AdminFlagsController } from './controllers/admin-flags.controller';
import { AdminExportController } from './controllers/admin-export.controller';
import { UserEntity } from '../users/entities/user.entity';
import { CommunityEntity } from '../communities/entities/community.entity';
import { CategoryEntity } from '../categories/entities/category.entity';
import { PostEntity } from '../posts/entities/post.entity';
import { CommentEntity } from '../comments/entities/comment.entity';
import { FlagEntity } from '../flags/entities/flag.entity';
import { CommunityMemberEntity } from '../communities/entities/community-member.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      CommunityEntity,
      CategoryEntity,
      PostEntity,
      CommentEntity,
      FlagEntity,
      CommunityMemberEntity,
    ]),
  ],
  controllers: [
    AdminDashboardController,
    AdminUsersController,
    AdminCommunitiesController,
    AdminCategoriesController,
    AdminPostsController,
    AdminCommentsController,
    AdminFlagsController,
    AdminExportController,
  ],
  providers: [AdminService],
})
export class AdminModule {}
