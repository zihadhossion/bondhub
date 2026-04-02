import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { PostEntity } from './entities/post.entity';
import { PostLikeEntity } from './entities/post-like.entity';
import { CommunityMemberEntity } from '../communities/entities/community-member.entity';
import { FollowEntity } from '../users/entities/follow.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PostEntity, PostLikeEntity, CommunityMemberEntity, FollowEntity])],
  controllers: [PostsController],
  providers: [PostsService],
  exports: [PostsService],
})
export class PostsModule {}
