import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserEntity } from '../users/entities/user.entity';
import { UserStatusEnum } from '../../shared/enums/user-status.enum';
import { RoleEnum } from '../../shared/enums/role.enum';
import * as bcrypt from 'bcrypt';

const mockUser: UserEntity = {
  id: 'uuid-1',
  email: 'user@test.com',
  password: '',
  displayName: 'Test User',
  role: RoleEnum.user,
  status: UserStatusEnum.active,
  bio: null,
  profilePicture: null,
  lastLoginAt: null,
  refreshTokenHash: null,
  resetPasswordToken: null,
  resetPasswordExpires: null,
  posts: [],
  comments: [],
  communityMemberships: [],
  following: [],
  followers: [],
  flags: [],
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
} as UserEntity;

describe('AuthService', () => {
  let service: AuthService;
  let userRepo: jest.Mocked<any>;
  let jwtService: jest.Mocked<JwtService>;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    userRepo = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn().mockResolvedValue(undefined),
    };
    jwtService = {
      sign: jest.fn().mockReturnValue('mock-token'),
    } as unknown as jest.Mocked<JwtService>;
    configService = {
      getOrThrow: jest.fn().mockReturnValue('test-jwt-secret'),
      get: jest.fn().mockReturnValue('test'),
    } as unknown as jest.Mocked<ConfigService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(UserEntity), useValue: userRepo },
        { provide: JwtService, useValue: jwtService },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    it('should throw ConflictException if email already exists', async () => {
      userRepo.findOne.mockResolvedValue(mockUser);
      await expect(
        service.register({ email: 'user@test.com', password: 'Pass@1', displayName: 'User' }, {} as any),
      ).rejects.toThrow(ConflictException);
    });

    it('should create user when email is unique', async () => {
      userRepo.findOne.mockResolvedValue(null);
      userRepo.create.mockReturnValue({ ...mockUser });
      userRepo.save.mockResolvedValue({ ...mockUser });
      const res = {} as any;
      res.cookie = jest.fn();
      await expect(
        service.register({ email: 'new@test.com', password: 'Pass@1', displayName: 'User' }, res),
      ).resolves.toBeDefined();
    });
  });

  describe('login', () => {
    it('should throw UnauthorizedException for wrong password', async () => {
      const hashed = await bcrypt.hash('correct-pass', 10);
      userRepo.findOne.mockResolvedValue({ ...mockUser, password: hashed });
      const res = {} as any;
      res.cookie = jest.fn();
      await expect(
        service.login({ email: 'user@test.com', password: 'wrong-pass' }, res),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for non-existent user', async () => {
      userRepo.findOne.mockResolvedValue(null);
      const res = {} as any;
      await expect(
        service.login({ email: 'noone@test.com', password: 'Pass@1' }, res),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for suspended user', async () => {
      const hashed = await bcrypt.hash('Pass@1', 10);
      userRepo.findOne.mockResolvedValue({
        ...mockUser,
        password: hashed,
        status: UserStatusEnum.suspended,
      });
      const res = {} as any;
      await expect(
        service.login({ email: 'user@test.com', password: 'Pass@1' }, res),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should succeed with correct credentials', async () => {
      const hashed = await bcrypt.hash('Pass@1', 10);
      const user = { ...mockUser, password: hashed };
      userRepo.findOne.mockResolvedValue(user);
      userRepo.save.mockResolvedValue(user);
      const res = { cookie: jest.fn() } as any;
      const result = await service.login({ email: 'user@test.com', password: 'Pass@1' }, res);
      expect(result).toBeDefined();
      expect(res.cookie).toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('should clear refresh token and cookies', async () => {
      const user = { ...mockUser, refreshTokenHash: 'some-hash' };
      userRepo.findOne.mockResolvedValue(user);
      userRepo.save.mockResolvedValue({ ...user, refreshTokenHash: null });
      const res = { clearCookie: jest.fn() } as any;
      await service.logout('uuid-1', res);
      expect(res.clearCookie).toHaveBeenCalledWith('accessToken', expect.any(Object));
      expect(res.clearCookie).toHaveBeenCalledWith('refreshToken', expect.any(Object));
    });
  });
});
