import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository, PaginatedResult } from '../../core/base/base.repository';
import { UserEntity } from './entities/user.entity';
import { FollowEntity } from './entities/follow.entity';

@Injectable()
export class UsersRepository extends BaseRepository<UserEntity> {
  constructor(
    @InjectRepository(UserEntity)
    repository: Repository<UserEntity>,
    @InjectRepository(FollowEntity)
    private readonly followRepository: Repository<FollowEntity>,
  ) {
    super(repository);
  }

  async findWithCounts(
    id: string,
    currentUserId?: string,
  ): Promise<(UserEntity & { followersCount: number; followingCount: number; communitiesCount: number; isFollowing: boolean }) | null> {
    const result = await this.repository
      .createQueryBuilder('user')
      .where('user.id = :id AND user.deleted_at IS NULL', { id })
      .loadRelationCountAndMap('user.followersCount', 'user.followers')
      .loadRelationCountAndMap('user.followingCount', 'user.following')
      .loadRelationCountAndMap('user.communitiesCount', 'user.communityMemberships')
      .getOne();

    if (!result) return null;

    let isFollowing = false;
    if (currentUserId && currentUserId !== id) {
      const follow = await this.followRepository.findOne({
        where: { followerId: currentUserId, followingId: id },
      });
      isFollowing = !!follow;
    }

    const typedResult = result as UserEntity & { followersCount: number; followingCount: number; communitiesCount: number; isFollowing: boolean };
    typedResult.isFollowing = isFollowing;
    return typedResult;
  }

  async findFollowers(userId: string, page: number, limit: number): Promise<PaginatedResult<UserEntity>> {
    const skip = (page - 1) * limit;
    const [follows, totalItems] = await this.followRepository.findAndCount({
      where: { followingId: userId },
      relations: ['follower'],
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });
    const data = follows.map((f) => f.follower);
    return { data, meta: { page, limit, totalItems, totalPages: Math.ceil(totalItems / limit) } };
  }

  async findFollowing(userId: string, page: number, limit: number): Promise<PaginatedResult<UserEntity>> {
    const skip = (page - 1) * limit;
    const [follows, totalItems] = await this.followRepository.findAndCount({
      where: { followerId: userId },
      relations: ['following'],
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });
    const data = follows.map((f) => f.following);
    return { data, meta: { page, limit, totalItems, totalPages: Math.ceil(totalItems / limit) } };
  }

  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    const follow = await this.followRepository.findOne({
      where: { followerId, followingId },
    });
    return !!follow;
  }

  async createFollow(followerId: string, followingId: string): Promise<void> {
    const follow = this.followRepository.create({ followerId, followingId });
    await this.followRepository.save(follow);
  }

  async deleteFollow(followerId: string, followingId: string): Promise<void> {
    await this.followRepository.delete({ followerId, followingId });
  }
}
