import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostEntity } from './entities/post.entity';
import { PostLikeEntity } from './entities/post-like.entity';
import { CreatePostDto } from './dtos/create-post.dto';
import { UpdatePostDto } from './dtos/update-post.dto';
import { CommunityMemberEntity } from '../communities/entities/community-member.entity';
import { FollowEntity } from '../users/entities/follow.entity';
import { PaginatedResult } from '../../core/base/base.repository';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(PostEntity)
    private readonly postRepository: Repository<PostEntity>,
    @InjectRepository(PostLikeEntity)
    private readonly postLikeRepository: Repository<PostLikeEntity>,
    @InjectRepository(CommunityMemberEntity)
    private readonly memberRepository: Repository<CommunityMemberEntity>,
    @InjectRepository(FollowEntity)
    private readonly followRepository: Repository<FollowEntity>,
  ) {}

  async getFeed(userId: string, page: number, limit: number): Promise<PaginatedResult<PostEntity>> {
    const skip = (page - 1) * limit;

    const memberships = await this.memberRepository.find({ where: { userId } });
    const communityIds = memberships.map((m) => m.communityId);

    const followedUsers = await this.followRepository.find({ where: { followerId: userId } });
    const followedUserIds = followedUsers.map((f) => f.followingId);

    if (communityIds.length === 0 && followedUserIds.length === 0) {
      return { data: [], meta: { page, limit, totalItems: 0, totalPages: 0 } };
    }

    const qb = this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .leftJoinAndSelect('post.community', 'community')
      .where('post.deleted_at IS NULL');

    const conditions: string[] = [];
    if (communityIds.length > 0) {
      conditions.push('post.community_id IN (:...communityIds)');
    }
    if (followedUserIds.length > 0) {
      conditions.push('post.author_id IN (:...followedUserIds)');
    }
    if (conditions.length > 0) {
      qb.andWhere(`(${conditions.join(' OR ')})`, { communityIds, followedUserIds });
    }

    qb.orderBy('post.createdAt', 'DESC').skip(skip).take(limit);

    const [data, totalItems] = await qb.getManyAndCount();
    return { data, meta: { page, limit, totalItems, totalPages: Math.ceil(totalItems / limit) } };
  }

  async create(dto: CreatePostDto, authorId: string): Promise<PostEntity> {
    const isMember = await this.memberRepository.findOne({
      where: { userId: authorId, communityId: dto.communityId },
    });
    if (!isMember) {
      throw new ForbiddenException('You must be a member of this community to post!');
    }

    const post = this.postRepository.create({
      title: dto.title,
      content: dto.content,
      communityId: dto.communityId,
      authorId,
    });
    const saved = await this.postRepository.save(post);
    return this.postRepository.findOne({
      where: { id: saved.id },
      relations: ['author', 'community'],
    }) as Promise<PostEntity>;
  }

  async findById(id: string, userId?: string): Promise<PostEntity & { likesCount: number; isLiked: boolean }> {
    const post = await this.postRepository.findOne({
      where: { id },
      relations: ['author', 'community'],
    });
    if (!post) throw new NotFoundException('Post not found!');

    const likesCount = await this.postLikeRepository.count({ where: { postId: id } });
    const isLiked = userId
      ? !!(await this.postLikeRepository.findOne({ where: { postId: id, userId } }))
      : false;

    return { ...post, likesCount, isLiked };
  }

  async toggleLike(postId: string, userId: string): Promise<{ liked: boolean; likesCount: number }> {
    const post = await this.postRepository.findOne({ where: { id: postId } });
    if (!post) throw new NotFoundException('Post not found!');

    const existing = await this.postLikeRepository.findOne({ where: { postId, userId } });
    if (existing) {
      await this.postLikeRepository.delete({ postId, userId });
    } else {
      await this.postLikeRepository.save(this.postLikeRepository.create({ postId, userId }));
    }

    const likesCount = await this.postLikeRepository.count({ where: { postId } });
    return { liked: !existing, likesCount };
  }

  async update(id: string, userId: string, dto: UpdatePostDto): Promise<PostEntity> {
    const post = await this.postRepository.findOne({ where: { id } });
    if (!post) throw new NotFoundException('Post not found!');
    if (post.authorId !== userId) throw new ForbiddenException('You do not have permission to modify this post!');

    Object.assign(post, dto);
    await this.postRepository.save(post);
    return this.postRepository.findOne({ where: { id }, relations: ['author', 'community'] }) as Promise<PostEntity>;
  }

  async delete(id: string, userId: string): Promise<void> {
    const post = await this.postRepository.findOne({ where: { id } });
    if (!post) throw new NotFoundException('Post not found!');
    if (post.authorId !== userId) throw new ForbiddenException('You do not have permission to modify this post!');
    await this.postRepository.softRemove(post);
  }
}
