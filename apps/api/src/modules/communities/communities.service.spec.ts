import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { CommunitiesService } from './communities.service';
import { CommunitiesRepository } from './communities.repository';
import { CommunityEntity } from './entities/community.entity';
import { CommunityMemberEntity } from './entities/community-member.entity';
import { PostEntity } from '../posts/entities/post.entity';
import { CommunityStatusEnum } from '../../shared/enums/community-status.enum';

const mockCommunity = {
  id: 'community-1',
  name: 'Test Community',
  status: CommunityStatusEnum.active,
  categoryId: 'cat-1',
} as CommunityEntity;

describe('CommunitiesService', () => {
  let service: CommunitiesService;
  let communitiesRepo: jest.Mocked<CommunitiesRepository>;
  let postRepo: jest.Mocked<any>;

  beforeEach(async () => {
    communitiesRepo = {
      findById: jest.fn(),
      isMember: jest.fn(),
      join: jest.fn(),
      leave: jest.fn(),
      findAllPaginated: jest.fn(),
      findByIdWithCounts: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
      getMembers: jest.fn(),
    } as unknown as jest.Mocked<CommunitiesRepository>;

    postRepo = {
      findAndCount: jest.fn().mockResolvedValue([[], 0]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommunitiesService,
        { provide: CommunitiesRepository, useValue: communitiesRepo },
        { provide: getRepositoryToken(PostEntity), useValue: postRepo },
      ],
    }).compile();

    service = module.get<CommunitiesService>(CommunitiesService);
  });

  describe('join', () => {
    it('should throw NotFoundException if community not found', async () => {
      communitiesRepo.findById.mockResolvedValue(null);
      await expect(service.join('user-1', 'community-1')).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if community is archived', async () => {
      communitiesRepo.findById.mockResolvedValue({
        ...mockCommunity,
        status: CommunityStatusEnum.archived,
      });
      await expect(service.join('user-1', 'community-1')).rejects.toThrow(BadRequestException);
    });

    it('should throw ConflictException if already a member', async () => {
      communitiesRepo.findById.mockResolvedValue(mockCommunity);
      communitiesRepo.isMember.mockResolvedValue(true);
      await expect(service.join('user-1', 'community-1')).rejects.toThrow(ConflictException);
    });

    it('should join if not already a member', async () => {
      communitiesRepo.findById.mockResolvedValue(mockCommunity);
      communitiesRepo.isMember.mockResolvedValue(false);
      communitiesRepo.join.mockResolvedValue(undefined);
      await expect(service.join('user-1', 'community-1')).resolves.not.toThrow();
      expect(communitiesRepo.join).toHaveBeenCalledWith('user-1', 'community-1');
    });
  });

  describe('leave', () => {
    it('should throw NotFoundException if community not found', async () => {
      communitiesRepo.findById.mockResolvedValue(null);
      await expect(service.leave('user-1', 'community-1')).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if not a member', async () => {
      communitiesRepo.findById.mockResolvedValue(mockCommunity);
      communitiesRepo.isMember.mockResolvedValue(false);
      await expect(service.leave('user-1', 'community-1')).rejects.toThrow(BadRequestException);
    });

    it('should leave if currently a member', async () => {
      communitiesRepo.findById.mockResolvedValue(mockCommunity);
      communitiesRepo.isMember.mockResolvedValue(true);
      communitiesRepo.leave.mockResolvedValue(undefined);
      await expect(service.leave('user-1', 'community-1')).resolves.not.toThrow();
      expect(communitiesRepo.leave).toHaveBeenCalledWith('user-1', 'community-1');
    });
  });

  describe('findById', () => {
    it('should throw NotFoundException if community not found', async () => {
      communitiesRepo.findByIdWithCounts.mockResolvedValue(null);
      await expect(service.findById('nonexistent', 'user-1')).rejects.toThrow(NotFoundException);
    });

    it('should return community if found', async () => {
      const communityWithCounts = { ...mockCommunity, membersCount: 5, postsCount: 10, isMember: true };
      communitiesRepo.findByIdWithCounts.mockResolvedValue(communityWithCounts);
      const result = await service.findById('community-1', 'user-1');
      expect(result).toBeDefined();
      expect(result.id).toBe('community-1');
    });
  });
});
