import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentEntity } from './entities/comment.entity';

const mockComment = {
  id: 'comment-1',
  content: 'Test comment',
  authorId: 'user-1',
  postId: 'post-1',
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
} as CommentEntity;

describe('CommentsService', () => {
  let service: CommentsService;
  let commentRepo: jest.Mocked<any>;

  beforeEach(async () => {
    commentRepo = {
      findOne: jest.fn(),
      find: jest.fn(),
      findAndCount: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      softRemove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentsService,
        { provide: getRepositoryToken(CommentEntity), useValue: commentRepo },
      ],
    }).compile();

    service = module.get<CommentsService>(CommentsService);
  });

  describe('delete', () => {
    it('should throw NotFoundException if comment not found', async () => {
      commentRepo.findOne.mockResolvedValue(null);
      await expect(service.delete('nonexistent', 'user-1')).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user is not owner', async () => {
      commentRepo.findOne.mockResolvedValue(mockComment);
      await expect(service.delete('comment-1', 'other-user')).rejects.toThrow(ForbiddenException);
    });

    it('should soft delete if user is owner', async () => {
      commentRepo.findOne.mockResolvedValue(mockComment);
      commentRepo.softRemove.mockResolvedValue(undefined);
      await expect(service.delete('comment-1', 'user-1')).resolves.not.toThrow();
      expect(commentRepo.softRemove).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should create comment', async () => {
      commentRepo.create.mockReturnValue(mockComment);
      commentRepo.save.mockResolvedValue(mockComment);
      commentRepo.findOne.mockResolvedValue(mockComment);
      const result = await service.create('post-1', { content: 'Hi' }, 'user-1');
      expect(result).toBeDefined();
    });
  });

  describe('getComments', () => {
    it('should return paginated comments', async () => {
      commentRepo.findAndCount.mockResolvedValue([[mockComment], 1]);
      const result = await service.getComments('post-1', 1, 10);
      expect(result.data).toHaveLength(1);
      expect(result.meta.totalItems).toBe(1);
    });

    it('should return empty page when no comments', async () => {
      commentRepo.findAndCount.mockResolvedValue([[], 0]);
      const result = await service.getComments('post-1', 1, 10);
      expect(result.data).toHaveLength(0);
      expect(result.meta.totalPages).toBe(0);
    });
  });
});
