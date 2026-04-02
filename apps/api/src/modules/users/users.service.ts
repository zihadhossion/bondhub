import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersRepository } from './users.repository';
import { UserEntity } from './entities/user.entity';
import { UpdateProfileDto } from './dtos/update-profile.dto';
import { ChangePasswordDto } from './dtos/change-password.dto';
import { PaginatedResult } from '../../core/base/base.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostEntity } from '../posts/entities/post.entity';
import { CloudinaryService } from '../../shared/cloudinary/cloudinary.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationTypeEnum } from '../../shared/enums/notification-type.enum';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    @InjectRepository(PostEntity)
    private readonly postRepository: Repository<PostEntity>,
    private readonly cloudinaryService: CloudinaryService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async getMe(userId: string): Promise<UserEntity & { followersCount: number; followingCount: number; communitiesCount: number }> {
    const user = await this.usersRepository.findWithCounts(userId);
    if (!user) throw new NotFoundException('User not found!');
    return user;
  }

  async getProfile(
    id: string,
    currentUserId: string,
  ): Promise<UserEntity & { followersCount: number; followingCount: number; communitiesCount: number; isFollowing: boolean }> {
    const user = await this.usersRepository.findWithCounts(id, currentUserId);
    if (!user) throw new NotFoundException('User not found!');
    return user;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<UserEntity> {
    const user = await this.usersRepository.findById(userId);
    if (!user) throw new NotFoundException('User not found!');
    return this.usersRepository.update(user, dto as Partial<UserEntity>);
  }

  async uploadAvatar(userId: string, file: Express.Multer.File): Promise<{ avatarUrl: string }> {
    const user = await this.usersRepository.findById(userId);
    if (!user) throw new NotFoundException('User not found!');

    const avatarUrl = await this.cloudinaryService.uploadImage(file, 'bondhub/avatars');
    await this.usersRepository.update(user, { profilePicture: avatarUrl } as Partial<UserEntity>);
    return { avatarUrl };
  }

  async changePassword(userId: string, dto: ChangePasswordDto): Promise<void> {
    const user = await this.usersRepository.findById(userId);
    if (!user) throw new NotFoundException('User not found!');

    const match = await bcrypt.compare(dto.currentPassword, user.password);
    if (!match) throw new BadRequestException('Current password is incorrect!');

    const hashed = await bcrypt.hash(dto.newPassword, 10);
    await this.usersRepository.update(user, { password: hashed } as Partial<UserEntity>);
  }

  async getUserPosts(userId: string, page: number, limit: number): Promise<PaginatedResult<PostEntity>> {
    const skip = (page - 1) * limit;
    const [data, totalItems] = await this.postRepository.findAndCount({
      where: { authorId: userId },
      relations: ['author', 'community'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });
    return { data, meta: { page, limit, totalItems, totalPages: Math.ceil(totalItems / limit) } };
  }

  async followUser(followerId: string, followingId: string): Promise<void> {
    if (followerId === followingId) {
      throw new ForbiddenException('You cannot follow yourself!');
    }
    const targetUser = await this.usersRepository.findById(followingId);
    if (!targetUser) throw new NotFoundException('User not found!');

    const already = await this.usersRepository.isFollowing(followerId, followingId);
    if (already) throw new ConflictException('You are already following this user!');

    await this.usersRepository.createFollow(followerId, followingId);

    const follower = await this.usersRepository.findById(followerId);
    if (follower) {
      await this.notificationsService.createNotification({
        userId: followingId,
        type: NotificationTypeEnum.new_follower,
        title: 'New follower',
        message: `${follower.displayName} started following you`,
        relatedUserId: followerId,
      });
    }
  }

  async unfollowUser(followerId: string, followingId: string): Promise<void> {
    const targetUser = await this.usersRepository.findById(followingId);
    if (!targetUser) throw new NotFoundException('User not found!');

    const following = await this.usersRepository.isFollowing(followerId, followingId);
    if (!following) throw new BadRequestException('You are not following this user!');

    await this.usersRepository.deleteFollow(followerId, followingId);
  }

  async getFollowers(userId: string, page: number, limit: number): Promise<PaginatedResult<UserEntity>> {
    const user = await this.usersRepository.findById(userId);
    if (!user) throw new NotFoundException('User not found!');
    return this.usersRepository.findFollowers(userId, page, limit);
  }

  async getFollowing(userId: string, page: number, limit: number): Promise<PaginatedResult<UserEntity>> {
    const user = await this.usersRepository.findById(userId);
    if (!user) throw new NotFoundException('User not found!');
    return this.usersRepository.findFollowing(userId, page, limit);
  }
}
