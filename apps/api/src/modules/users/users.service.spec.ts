import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { UserEntity } from './entities/user.entity';
import { PostEntity } from '../posts/entities/post.entity';
import { RoleEnum } from '../../shared/enums/role.enum';
import { UserStatusEnum } from '../../shared/enums/user-status.enum';
import * as bcrypt from 'bcrypt';

const mockUser: Partial<UserEntity> = {
  id: 'user-1',
  email: 'user@test.com',
  displayName: 'Test User',
  role: RoleEnum.user,
  status: UserStatusEnum.active,
  password: '',
};

describe('UsersService', () => {
  let service: UsersService;
  let usersRepo: jest.Mocked<UsersRepository>;
  let postRepo: jest.Mocked<any>;

  beforeEach(async () => {
    usersRepo = {
      findById: jest.fn(),
      findWithCounts: jest.fn(),
      update: jest.fn(),
      isFollowing: jest.fn(),
      createFollow: jest.fn(),
      deleteFollow: jest.fn(),
      findFollowers: jest.fn(),
      findFollowing: jest.fn(),
    } as unknown as jest.Mocked<UsersRepository>;

    postRepo = {
      findAndCount: jest.fn().mockResolvedValue([[], 0]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: UsersRepository, useValue: usersRepo },
        { provide: getRepositoryToken(PostEntity), useValue: postRepo },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  describe('followUser', () => {
    it('should throw ForbiddenException for self-follow', async () => {
      await expect(service.followUser('user-1', 'user-1')).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if target user not found', async () => {
      usersRepo.findById.mockResolvedValue(null);
      await expect(service.followUser('user-1', 'user-2')).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException if already following', async () => {
      usersRepo.findById.mockResolvedValue(mockUser as UserEntity);
      usersRepo.isFollowing.mockResolvedValue(true);
      await expect(service.followUser('user-1', 'user-2')).rejects.toThrow(ConflictException);
    });

    it('should create follow relationship', async () => {
      usersRepo.findById.mockResolvedValue(mockUser as UserEntity);
      usersRepo.isFollowing.mockResolvedValue(false);
      usersRepo.createFollow.mockResolvedValue(undefined);
      await expect(service.followUser('user-1', 'user-2')).resolves.not.toThrow();
      expect(usersRepo.createFollow).toHaveBeenCalledWith('user-1', 'user-2');
    });
  });

  describe('unfollowUser', () => {
    it('should throw NotFoundException if target user not found', async () => {
      usersRepo.findById.mockResolvedValue(null);
      await expect(service.unfollowUser('user-1', 'user-2')).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if not following', async () => {
      usersRepo.findById.mockResolvedValue(mockUser as UserEntity);
      usersRepo.isFollowing.mockResolvedValue(false);
      await expect(service.unfollowUser('user-1', 'user-2')).rejects.toThrow(BadRequestException);
    });

    it('should remove follow relationship', async () => {
      usersRepo.findById.mockResolvedValue(mockUser as UserEntity);
      usersRepo.isFollowing.mockResolvedValue(true);
      usersRepo.deleteFollow.mockResolvedValue(undefined);
      await expect(service.unfollowUser('user-1', 'user-2')).resolves.not.toThrow();
      expect(usersRepo.deleteFollow).toHaveBeenCalled();
    });
  });

  describe('changePassword', () => {
    it('should throw BadRequestException for wrong current password', async () => {
      const hash = await bcrypt.hash('correct', 10);
      usersRepo.findById.mockResolvedValue({ ...mockUser, password: hash } as UserEntity);
      await expect(
        service.changePassword('user-1', { currentPassword: 'wrong', newPassword: 'New@1234' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should update password with correct current password', async () => {
      const hash = await bcrypt.hash('correct', 10);
      usersRepo.findById.mockResolvedValue({ ...mockUser, password: hash } as UserEntity);
      usersRepo.update.mockResolvedValue(mockUser as UserEntity);
      await expect(
        service.changePassword('user-1', { currentPassword: 'correct', newPassword: 'New@1234' }),
      ).resolves.not.toThrow();
      expect(usersRepo.update).toHaveBeenCalled();
    });

    it('should throw NotFoundException if user not found', async () => {
      usersRepo.findById.mockResolvedValue(null);
      await expect(
        service.changePassword('nonexistent', { currentPassword: 'x', newPassword: 'New@1234' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getProfile', () => {
    it('should throw NotFoundException if user not found', async () => {
      usersRepo.findWithCounts.mockResolvedValue(null);
      await expect(service.getProfile('nonexistent', 'user-1')).rejects.toThrow(NotFoundException);
    });

    it('should return user with counts', async () => {
      const userWithCounts = { ...mockUser, followersCount: 5, followingCount: 3, communitiesCount: 2, isFollowing: false };
      usersRepo.findWithCounts.mockResolvedValue(userWithCounts as unknown as any);
      const result = await service.getProfile('user-1', 'user-2');
      expect(result).toBeDefined();
    });
  });
});
