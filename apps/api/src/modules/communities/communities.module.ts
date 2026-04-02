import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommunitiesController } from './communities.controller';
import { CommunitiesService } from './communities.service';
import { CommunitiesRepository } from './communities.repository';
import { CommunityEntity } from './entities/community.entity';
import { CommunityMemberEntity } from './entities/community-member.entity';
import { PostEntity } from '../posts/entities/post.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CommunityEntity, CommunityMemberEntity, PostEntity])],
  controllers: [CommunitiesController],
  providers: [CommunitiesService, CommunitiesRepository],
  exports: [CommunitiesService, CommunitiesRepository],
})
export class CommunitiesModule {}
