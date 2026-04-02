import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { CommunitiesRepository } from './communities.repository';
import { CommunityEntity } from './entities/community.entity';
import { CreateCommunityDto } from './dtos/create-community.dto';
import { UpdateCommunityDto } from './dtos/update-community.dto';
import { PaginatedResult } from '../../core/base/base.repository';
import { UserEntity } from '../users/entities/user.entity';
import { PostEntity } from '../posts/entities/post.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommunityStatusEnum } from '../../shared/enums/community-status.enum';

@Injectable()
export class CommunitiesService {
  constructor(
    private readonly communitiesRepository: CommunitiesRepository,
    @InjectRepository(PostEntity)
    private readonly postRepository: Repository<PostEntity>,
  ) {}

  async findAll(
    page: number,
    limit: number,
    currentUserId: string,
    search?: string,
    categoryId?: string,
    sortBy?: string,
    sortOrder?: 'ASC' | 'DESC',
  ) {
    return this.communitiesRepository.findAllPaginated(
      page,
      limit,
      currentUserId,
      search,
      categoryId,
      sortBy,
      sortOrder,
    );
  }

  async findById(id: string, currentUserId: string) {
    const community = await this.communitiesRepository.findByIdWithCounts(id, currentUserId);
    if (!community) throw new NotFoundException('Community not found!');
    return community;
  }

  async create(dto: CreateCommunityDto, createdById: string): Promise<CommunityEntity> {
    return this.communitiesRepository.create({
      ...dto,
      createdById,
      coverImage: dto.coverImage ?? null,
    });
  }

  async update(id: string, dto: UpdateCommunityDto): Promise<CommunityEntity> {
    const community = await this.communitiesRepository.findById(id);
    if (!community) throw new NotFoundException('Community not found!');
    return this.communitiesRepository.update(community, dto as Partial<CommunityEntity>);
  }

  async updateStatus(id: string, status: CommunityStatusEnum): Promise<CommunityEntity> {
    const community = await this.communitiesRepository.findById(id);
    if (!community) throw new NotFoundException('Community not found!');
    return this.communitiesRepository.update(community, { status });
  }

  async delete(id: string): Promise<void> {
    const community = await this.communitiesRepository.findById(id);
    if (!community) throw new NotFoundException('Community not found!');
    await this.communitiesRepository.softDelete(community);
  }

  async join(userId: string, communityId: string): Promise<void> {
    const community = await this.communitiesRepository.findById(communityId);
    if (!community) throw new NotFoundException('Community not found!');
    if (community.status === CommunityStatusEnum.archived) {
      throw new BadRequestException('This community is archived!');
    }
    const isMember = await this.communitiesRepository.isMember(userId, communityId);
    if (isMember) throw new ConflictException('You are already a member of this community!');
    await this.communitiesRepository.join(userId, communityId);
  }

  async leave(userId: string, communityId: string): Promise<void> {
    const community = await this.communitiesRepository.findById(communityId);
    if (!community) throw new NotFoundException('Community not found!');
    const isMember = await this.communitiesRepository.isMember(userId, communityId);
    if (!isMember) throw new BadRequestException('You are not a member of this community!');
    await this.communitiesRepository.leave(userId, communityId);
  }

  async getCommunityPosts(communityId: string, page: number, limit: number): Promise<PaginatedResult<PostEntity>> {
    const community = await this.communitiesRepository.findById(communityId);
    if (!community) throw new NotFoundException('Community not found!');

    const skip = (page - 1) * limit;
    const [data, totalItems] = await this.postRepository.findAndCount({
      where: { communityId },
      relations: ['author', 'community'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });
    return { data, meta: { page, limit, totalItems, totalPages: Math.ceil(totalItems / limit) } };
  }

  async getMembers(communityId: string, page: number, limit: number): Promise<PaginatedResult<UserEntity>> {
    const community = await this.communitiesRepository.findById(communityId);
    if (!community) throw new NotFoundException('Community not found!');
    return this.communitiesRepository.getMembers(communityId, page, limit);
  }
}
