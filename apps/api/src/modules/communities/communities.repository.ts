import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository, PaginatedResult } from '../../core/base/base.repository';
import { CommunityEntity } from './entities/community.entity';
import { CommunityMemberEntity } from './entities/community-member.entity';
import { UserEntity } from '../users/entities/user.entity';
import { CommunityStatusEnum } from '../../shared/enums/community-status.enum';

export interface CommunityWithCounts extends CommunityEntity {
  membersCount: number;
  postsCount: number;
  isMember: boolean;
}

@Injectable()
export class CommunitiesRepository extends BaseRepository<CommunityEntity> {
  constructor(
    @InjectRepository(CommunityEntity)
    repository: Repository<CommunityEntity>,
    @InjectRepository(CommunityMemberEntity)
    private readonly memberRepository: Repository<CommunityMemberEntity>,
  ) {
    super(repository);
  }

  async findAllPaginated(
    page: number,
    limit: number,
    currentUserId: string,
    search?: string,
    categoryId?: string,
    sortBy = 'createdAt',
    sortOrder: 'ASC' | 'DESC' = 'DESC',
  ): Promise<PaginatedResult<CommunityWithCounts>> {
    const skip = (page - 1) * limit;
    const qb = this.repository
      .createQueryBuilder('community')
      .leftJoinAndSelect('community.category', 'category')
      .leftJoinAndSelect('community.createdBy', 'createdBy')
      .leftJoin('community.members', 'member')
      .leftJoin('community.posts', 'post', 'post.deleted_at IS NULL')
      .addSelect('COUNT(DISTINCT member.id)', 'membersCount')
      .addSelect('COUNT(DISTINCT post.id)', 'postsCount')
      .where('community.deleted_at IS NULL')
      .andWhere('community.status = :status', { status: CommunityStatusEnum.active })
      .groupBy('community.id')
      .addGroupBy('category.id')
      .addGroupBy('createdBy.id')
      .skip(skip)
      .take(limit);

    if (search) {
      qb.andWhere('(community.name ILIKE :search OR community.description ILIKE :search)', {
        search: `%${search}%`,
      });
    }
    if (categoryId) {
      qb.andWhere('community.category_id = :categoryId', { categoryId });
    }

    const validSortFields: Record<string, string> = {
      createdAt: 'community.createdAt',
      name: 'community.name',
    };
    const sortField = validSortFields[sortBy] ?? 'community.createdAt';
    qb.orderBy(sortField, sortOrder);

    const { entities, raw } = await qb.getRawAndEntities();
    const totalItems = await qb.getCount();

    const data: CommunityWithCounts[] = entities.map((entity, i) => {
      const membersCount = parseInt(raw[i]?.membersCount ?? '0', 10);
      const postsCount = parseInt(raw[i]?.postsCount ?? '0', 10);
      return { ...entity, membersCount, postsCount, isMember: false };
    });

    if (currentUserId && data.length > 0) {
      const communityIds = data.map((c) => c.id);
      const memberships = await this.memberRepository.find({
        where: communityIds.map((id) => ({ communityId: id, userId: currentUserId })),
      });
      const memberSet = new Set(memberships.map((m) => m.communityId));
      data.forEach((c) => { c.isMember = memberSet.has(c.id); });
    }

    return { data, meta: { page, limit, totalItems, totalPages: Math.ceil(totalItems / limit) } };
  }

  async findByIdWithCounts(id: string, currentUserId: string): Promise<CommunityWithCounts | null> {
    const result = await this.repository
      .createQueryBuilder('community')
      .leftJoinAndSelect('community.category', 'category')
      .leftJoinAndSelect('community.createdBy', 'createdBy')
      .leftJoin('community.members', 'member')
      .leftJoin('community.posts', 'post', 'post.deleted_at IS NULL')
      .addSelect('COUNT(DISTINCT member.id)', 'membersCount')
      .addSelect('COUNT(DISTINCT post.id)', 'postsCount')
      .where('community.id = :id AND community.deleted_at IS NULL', { id })
      .groupBy('community.id')
      .addGroupBy('category.id')
      .addGroupBy('createdBy.id')
      .getRawAndEntities();

    if (!result.entities[0]) return null;

    const entity = result.entities[0];
    const membersCount = parseInt(result.raw[0]?.membersCount ?? '0', 10);
    const postsCount = parseInt(result.raw[0]?.postsCount ?? '0', 10);

    const membership = await this.memberRepository.findOne({
      where: { communityId: id, userId: currentUserId },
    });

    return { ...entity, membersCount, postsCount, isMember: !!membership };
  }

  async isMember(userId: string, communityId: string): Promise<boolean> {
    const m = await this.memberRepository.findOne({ where: { userId, communityId } });
    return !!m;
  }

  async join(userId: string, communityId: string): Promise<void> {
    const m = this.memberRepository.create({ userId, communityId });
    await this.memberRepository.save(m);
  }

  async leave(userId: string, communityId: string): Promise<void> {
    await this.memberRepository.delete({ userId, communityId });
  }

  async getMembers(communityId: string, page: number, limit: number): Promise<PaginatedResult<UserEntity>> {
    const skip = (page - 1) * limit;
    const [members, totalItems] = await this.memberRepository.findAndCount({
      where: { communityId },
      relations: ['user'],
      skip,
      take: limit,
      order: { joinedAt: 'ASC' },
    });
    return {
      data: members.map((m) => m.user),
      meta: { page, limit, totalItems, totalPages: Math.ceil(totalItems / limit) },
    };
  }
}
