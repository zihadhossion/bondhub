import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostEntity } from './entities/post.entity';
import { CommunityMemberEntity } from '../communities/entities/community-member.entity';
import { FollowEntity } from '../users/entities/follow.entity';

const mockPost = {
  id: 'post-1',
  title: 'Test Post',
  content: 'Content',
  authorId: 'user-1',
  communityId: 'community-1',
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
} as PostEntity;

describe('PostsService', () => {
  let service: PostsService;
  let postRepo: jest.Mocked<any>;
  let memberRepo: jest.Mocked<any>;
  let followRepo: jest.Mocked<any>;

  beforeEach(async () => {
    postRepo = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      softRemove: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      }),
    };
    memberRepo = {
      findOne: jest.fn(),
      find: jest.fn().mockResolvedValue([]),
    };
    followRepo = {
      find: jest.fn().mockResolvedValue([]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostsService,
        { provide: getRepositoryToken(PostEntity), useValue: postRepo },
        { provide: getRepositoryToken(CommunityMemberEntity), useValue: memberRepo },
        { provide: getRepositoryToken(FollowEntity), useValue: followRepo },
      ],
    }).compile();

    service = module.get<PostsService>(PostsService);
  });

  describe('findById', () => {
    it('should throw NotFoundException if post not found', async () => {
      postRepo.findOne.mockResolvedValue(null);
      await expect(service.findById('nonexistent')).rejects.toThrow(NotFoundException);
    });

    it('should return post if found', async () => {
      postRepo.findOne.mockResolvedValue(mockPost);
      const result = await service.findById('post-1');
      expect(result).toEqual(mockPost);
    });
  });

  describe('update', () => {
    it('should throw ForbiddenException if user is not owner', async () => {
      postRepo.findOne.mockResolvedValue(mockPost);
      await expect(
        service.update('post-1', 'other-user', { title: 'New Title' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if post not found', async () => {
      postRepo.findOne.mockResolvedValue(null);
      await expect(
        service.update('nonexistent', 'user-1', { title: 'New Title' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should update post if user is owner', async () => {
      const updatedPost = { ...mockPost, title: 'New Title' };
      postRepo.findOne.mockResolvedValueOnce(mockPost).mockResolvedValueOnce(updatedPost);
      postRepo.save.mockResolvedValue(updatedPost);
      const result = await service.update('post-1', 'user-1', { title: 'New Title' });
      expect(result.title).toBe('New Title');
    });
  });

  describe('delete', () => {
    it('should throw ForbiddenException if user is not owner', async () => {
      postRepo.findOne.mockResolvedValue(mockPost);
      await expect(service.delete('post-1', 'other-user')).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if post not found', async () => {
      postRepo.findOne.mockResolvedValue(null);
      await expect(service.delete('nonexistent', 'user-1')).rejects.toThrow(NotFoundException);
    });

    it('should soft delete if user is owner', async () => {
      postRepo.findOne.mockResolvedValue(mockPost);
      postRepo.softRemove.mockResolvedValue(undefined);
      await expect(service.delete('post-1', 'user-1')).resolves.not.toThrow();
      expect(postRepo.softRemove).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should throw ForbiddenException if user is not a community member', async () => {
      memberRepo.findOne.mockResolvedValue(null);
      await expect(
        service.create({ title: 'T', content: 'C', communityId: 'c-1' }, 'user-1'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should create post if user is member', async () => {
      memberRepo.findOne.mockResolvedValue({ id: 'member-1' });
      postRepo.create.mockReturnValue(mockPost);
      postRepo.save.mockResolvedValue(mockPost);
      postRepo.findOne.mockResolvedValue(mockPost);
      const result = await service.create(
        { title: 'Test Post', content: 'Content', communityId: 'community-1' },
        'user-1',
      );
      expect(result).toBeDefined();
    });
  });
});
