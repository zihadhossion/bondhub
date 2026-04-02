import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Between, MoreThanOrEqual } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserEntity } from '../users/entities/user.entity';
import { CommunityEntity } from '../communities/entities/community.entity';
import { CategoryEntity } from '../categories/entities/category.entity';
import { PostEntity } from '../posts/entities/post.entity';
import { CommentEntity } from '../comments/entities/comment.entity';
import { FlagEntity } from '../flags/entities/flag.entity';
import { CommunityMemberEntity } from '../communities/entities/community-member.entity';
import { UserStatusEnum } from '../../shared/enums/user-status.enum';
import { RoleEnum } from '../../shared/enums/role.enum';
import { CommunityStatusEnum } from '../../shared/enums/community-status.enum';
import { FlagStatusEnum } from '../../shared/enums/flag-status.enum';
import { ContentTypeEnum } from '../../shared/enums/content-type.enum';
import { AdminCreateUserDto } from './dtos/admin-user.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(CommunityEntity)
    private readonly communityRepo: Repository<CommunityEntity>,
    @InjectRepository(CategoryEntity)
    private readonly categoryRepo: Repository<CategoryEntity>,
    @InjectRepository(PostEntity)
    private readonly postRepo: Repository<PostEntity>,
    @InjectRepository(CommentEntity)
    private readonly commentRepo: Repository<CommentEntity>,
    @InjectRepository(FlagEntity)
    private readonly flagRepo: Repository<FlagEntity>,
    @InjectRepository(CommunityMemberEntity)
    private readonly memberRepo: Repository<CommunityMemberEntity>,
    private readonly dataSource: DataSource,
  ) {}

  // ─── Dashboard ───────────────────────────────────────────────────────────

  async getDashboardStats() {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      activeUsers,
      suspendedUsers,
      totalCommunities,
      activeCommunities,
      totalPosts,
      totalComments,
      pendingFlags,
      newUsersToday,
    ] = await Promise.all([
      this.userRepo.count({ withDeleted: false }),
      this.userRepo.count({ where: { status: UserStatusEnum.active } }),
      this.userRepo.count({ where: { status: UserStatusEnum.suspended } }),
      this.communityRepo.count({ withDeleted: false }),
      this.communityRepo.count({ where: { status: CommunityStatusEnum.active } }),
      this.postRepo.count({ withDeleted: false }),
      this.commentRepo.count({ withDeleted: false }),
      this.flagRepo.count({ where: { status: FlagStatusEnum.pending } }),
      this.userRepo.count({
        where: { createdAt: MoreThanOrEqual(yesterday) },
      }),
    ]);

    return {
      users: { total: totalUsers, active: activeUsers, suspended: suspendedUsers, newToday: newUsersToday },
      communities: { total: totalCommunities, active: activeCommunities },
      content: { posts: totalPosts, comments: totalComments },
      moderation: { pendingFlags },
    };
  }

  async getCharts(period: string) {
    const days = period === 'week' ? 7 : period === 'month' ? 30 : period === 'year' ? 365 : 30;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const userGrowth = await this.dataSource.query(
      `SELECT DATE(created_at) as date, COUNT(*) as count
       FROM users WHERE created_at >= $1 AND deleted_at IS NULL
       GROUP BY DATE(created_at) ORDER BY date ASC`,
      [since],
    );

    const postActivity = await this.dataSource.query(
      `SELECT DATE(created_at) as date, COUNT(*) as count
       FROM posts WHERE created_at >= $1 AND deleted_at IS NULL
       GROUP BY DATE(created_at) ORDER BY date ASC`,
      [since],
    );

    const communityGrowth = await this.dataSource.query(
      `SELECT DATE(created_at) as date, COUNT(*) as count
       FROM communities WHERE created_at >= $1 AND deleted_at IS NULL
       GROUP BY DATE(created_at) ORDER BY date ASC`,
      [since],
    );

    return { period, userGrowth, postActivity, communityGrowth };
  }

  async getRecentActivity(limit = 20) {
    const [recentUsers, recentPosts, recentFlags] = await Promise.all([
      this.userRepo.find({
        order: { createdAt: 'DESC' },
        take: Math.ceil(limit / 3),
        select: ['id', 'email', 'displayName', 'createdAt', 'status'],
      }),
      this.postRepo.find({
        order: { createdAt: 'DESC' },
        take: Math.ceil(limit / 3),
        relations: ['author'],
        select: { id: true, title: true, createdAt: true, author: { id: true, displayName: true } },
      }),
      this.flagRepo.find({
        order: { createdAt: 'DESC' },
        take: Math.ceil(limit / 3),
        relations: ['flaggedBy'],
        where: { status: FlagStatusEnum.pending },
      }),
    ]);

    const activities = [
      ...recentUsers.map((u) => ({ type: 'user_registered', data: u, timestamp: u.createdAt })),
      ...recentPosts.map((p) => ({ type: 'post_created', data: p, timestamp: p.createdAt })),
      ...recentFlags.map((f) => ({ type: 'content_flagged', data: f, timestamp: f.createdAt })),
    ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, limit);

    return activities;
  }

  // ─── Users ────────────────────────────────────────────────────────────────

  async getUsers(page = 1, limit = 20, search?: string, status?: UserStatusEnum, role?: RoleEnum) {
    const qb = this.userRepo.createQueryBuilder('user').withDeleted();

    if (search) {
      qb.andWhere('(user.email ILIKE :search OR user.displayName ILIKE :search)', { search: `%${search}%` });
    }
    if (status) qb.andWhere('user.status = :status', { status });
    if (role) qb.andWhere('user.role = :role', { role });

    qb.orderBy('user.createdAt', 'DESC').skip((page - 1) * limit).take(limit);

    const [data, totalItems] = await qb.getManyAndCount();
    return { data, meta: { page, limit, totalItems, totalPages: Math.ceil(totalItems / limit) } };
  }

  async createUser(dto: AdminCreateUserDto) {
    const existing = await this.userRepo.findOne({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email already in use');

    const hash = await bcrypt.hash(dto.password, 10);
    const user = this.userRepo.create({
      email: dto.email,
      password: hash,
      displayName: dto.displayName,
      role: dto.role ?? RoleEnum.user,
      status: UserStatusEnum.active,
    });
    return this.userRepo.save(user);
  }

  async getUserById(id: string) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateUserStatus(id: string, status: UserStatusEnum) {
    const user = await this.getUserById(id);
    user.status = status;
    return this.userRepo.save(user);
  }

  async resetUserPassword(id: string, newPassword: string) {
    const user = await this.getUserById(id);
    user.password = await bcrypt.hash(newPassword, 10);
    user.refreshTokenHash = null;
    return this.userRepo.save(user);
  }

  async deleteUser(id: string) {
    const user = await this.getUserById(id);
    await this.userRepo.softRemove(user);
  }

  async bulkUserAction(action: string, ids: string[]) {
    switch (action) {
      case 'delete':
        await Promise.all(ids.map((id) => this.userRepo.softDelete(id)));
        break;
      case 'suspend':
        await this.userRepo.update(ids, { status: UserStatusEnum.suspended });
        break;
      case 'activate':
        await this.userRepo.update(ids, { status: UserStatusEnum.active });
        break;
      default:
        throw new BadRequestException(`Unknown action: ${action}`);
    }
    return { affected: ids.length };
  }

  // ─── Communities ─────────────────────────────────────────────────────────

  async getCommunities(page = 1, limit = 20, search?: string, status?: CommunityStatusEnum) {
    const qb = this.communityRepo.createQueryBuilder('community')
      .leftJoinAndSelect('community.category', 'category')
      .withDeleted();

    if (search) {
      qb.andWhere('community.name ILIKE :search', { search: `%${search}%` });
    }
    if (status) qb.andWhere('community.status = :status', { status });

    qb.orderBy('community.createdAt', 'DESC').skip((page - 1) * limit).take(limit);

    const [data, totalItems] = await qb.getManyAndCount();
    return { data, meta: { page, limit, totalItems, totalPages: Math.ceil(totalItems / limit) } };
  }

  async getCommunityById(id: string) {
    const community = await this.communityRepo.findOne({
      where: { id },
      relations: ['category', 'createdBy'],
    });
    if (!community) throw new NotFoundException('Community not found');
    return community;
  }

  async createCommunity(dto: Partial<CommunityEntity>) {
    const community = this.communityRepo.create(dto);
    return this.communityRepo.save(community);
  }

  async updateCommunity(id: string, dto: Partial<CommunityEntity>) {
    await this.getCommunityById(id);
    await this.communityRepo.update(id, dto);
    return this.getCommunityById(id);
  }

  async updateCommunityStatus(id: string, status: CommunityStatusEnum) {
    const community = await this.getCommunityById(id);
    community.status = status;
    return this.communityRepo.save(community);
  }

  async deleteCommunity(id: string) {
    const community = await this.getCommunityById(id);
    await this.communityRepo.softRemove(community);
  }

  async bulkCommunityAction(action: string, ids: string[]) {
    switch (action) {
      case 'delete':
        await Promise.all(ids.map((id) => this.communityRepo.softDelete(id)));
        break;
      case 'archive':
        await this.communityRepo.update(ids, { status: CommunityStatusEnum.archived });
        break;
      case 'activate':
        await this.communityRepo.update(ids, { status: CommunityStatusEnum.active });
        break;
      default:
        throw new BadRequestException(`Unknown action: ${action}`);
    }
    return { affected: ids.length };
  }

  // ─── Categories ───────────────────────────────────────────────────────────

  async getCategories(page = 1, limit = 50) {
    const [data, totalItems] = await this.categoryRepo.findAndCount({
      order: { name: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, meta: { page, limit, totalItems, totalPages: Math.ceil(totalItems / limit) } };
  }

  async createCategory(name: string, description?: string) {
    const existing = await this.categoryRepo.findOne({ where: { name } });
    if (existing) throw new ConflictException('Category name already exists');
    const category = this.categoryRepo.create({ name, description });
    return this.categoryRepo.save(category);
  }

  async updateCategory(id: string, name: string, description?: string) {
    const category = await this.categoryRepo.findOne({ where: { id } });
    if (!category) throw new NotFoundException('Category not found');
    if (name) category.name = name;
    if (description !== undefined) category.description = description ?? null;
    return this.categoryRepo.save(category);
  }

  async deleteCategory(id: string) {
    const category = await this.categoryRepo.findOne({ where: { id } });
    if (!category) throw new NotFoundException('Category not found');

    const communityCount = await this.communityRepo.count({ where: { categoryId: id } });
    if (communityCount > 0) {
      throw new ConflictException('Cannot delete category with assigned communities');
    }
    await this.categoryRepo.softRemove(category);
  }

  // ─── Posts ────────────────────────────────────────────────────────────────

  async getPosts(page = 1, limit = 20, search?: string) {
    const qb = this.postRepo.createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .leftJoinAndSelect('post.community', 'community')
      .withDeleted();

    if (search) {
      qb.andWhere('(post.title ILIKE :search OR post.content ILIKE :search)', { search: `%${search}%` });
    }

    qb.orderBy('post.createdAt', 'DESC').skip((page - 1) * limit).take(limit);

    const [data, totalItems] = await qb.getManyAndCount();
    return { data, meta: { page, limit, totalItems, totalPages: Math.ceil(totalItems / limit) } };
  }

  async getPostById(id: string) {
    const post = await this.postRepo.findOne({
      where: { id },
      relations: ['author', 'community', 'comments', 'comments.author'],
      withDeleted: true,
    });
    if (!post) throw new NotFoundException('Post not found');
    return post;
  }

  async deletePost(id: string) {
    const post = await this.postRepo.findOne({ where: { id } });
    if (!post) throw new NotFoundException('Post not found');
    await this.postRepo.softRemove(post);
  }

  async bulkPostAction(action: string, ids: string[]) {
    if (action !== 'delete') throw new BadRequestException(`Unknown action: ${action}`);
    await Promise.all(ids.map((id) => this.postRepo.softDelete(id)));
    return { affected: ids.length };
  }

  // ─── Comments ─────────────────────────────────────────────────────────────

  async getComments(page = 1, limit = 20, search?: string) {
    const qb = this.commentRepo.createQueryBuilder('comment')
      .leftJoinAndSelect('comment.author', 'author')
      .leftJoinAndSelect('comment.post', 'post')
      .withDeleted();

    if (search) {
      qb.andWhere('comment.content ILIKE :search', { search: `%${search}%` });
    }

    qb.orderBy('comment.createdAt', 'DESC').skip((page - 1) * limit).take(limit);

    const [data, totalItems] = await qb.getManyAndCount();
    return { data, meta: { page, limit, totalItems, totalPages: Math.ceil(totalItems / limit) } };
  }

  async deleteComment(id: string) {
    const comment = await this.commentRepo.findOne({ where: { id } });
    if (!comment) throw new NotFoundException('Comment not found');
    await this.commentRepo.softRemove(comment);
  }

  // ─── Flags ────────────────────────────────────────────────────────────────

  async getFlags(page = 1, limit = 20, status?: FlagStatusEnum) {
    const qb = this.flagRepo.createQueryBuilder('flag')
      .leftJoinAndSelect('flag.flaggedBy', 'flaggedBy');

    if (status) qb.andWhere('flag.status = :status', { status });

    qb.orderBy('flag.createdAt', 'DESC').skip((page - 1) * limit).take(limit);

    const [data, totalItems] = await qb.getManyAndCount();
    return { data, meta: { page, limit, totalItems, totalPages: Math.ceil(totalItems / limit) } };
  }

  async getFlagById(id: string) {
    const flag = await this.flagRepo.findOne({
      where: { id },
      relations: ['flaggedBy'],
    });
    if (!flag) throw new NotFoundException('Flag not found');
    return flag;
  }

  async resolveFlag(id: string) {
    const flag = await this.getFlagById(id);
    flag.status = FlagStatusEnum.resolved;
    await this.flagRepo.save(flag);

    // Soft-delete the flagged content
    if (flag.contentType === ContentTypeEnum.post) {
      await this.postRepo.softDelete(flag.contentId);
    } else if (flag.contentType === ContentTypeEnum.comment) {
      await this.commentRepo.softDelete(flag.contentId);
    }

    return flag;
  }

  async dismissFlag(id: string) {
    const flag = await this.getFlagById(id);
    flag.status = FlagStatusEnum.dismissed;
    return this.flagRepo.save(flag);
  }

  async bulkFlagAction(action: string, ids: string[]) {
    switch (action) {
      case 'delete_content':
        await Promise.all(ids.map((id) => this.resolveFlag(id)));
        break;
      case 'dismiss':
        await this.flagRepo.update(ids, { status: FlagStatusEnum.dismissed });
        break;
      case 'suspend_user': {
        const flags = await this.flagRepo.findByIds(ids);
        const userIds = [...new Set(flags.map((f) => f.flaggedById))];
        await this.userRepo.update(userIds, { status: UserStatusEnum.suspended });
        await this.flagRepo.update(ids, { status: FlagStatusEnum.resolved });
        break;
      }
      default:
        throw new BadRequestException(`Unknown action: ${action}`);
    }
    return { affected: ids.length };
  }

  // ─── Export ───────────────────────────────────────────────────────────────

  async exportCsv(entity: string): Promise<string> {
    let rows: Array<Record<string, unknown>> = [];
    let headers: string[] = [];

    if (entity === 'users') {
      const users = await this.userRepo.find({ select: ['id', 'email', 'displayName', 'role', 'status', 'createdAt'] });
      rows = users.map((u) => ({ id: u.id, email: u.email, displayName: u.displayName, role: u.role, status: u.status, createdAt: u.createdAt }));
      headers = ['id', 'email', 'displayName', 'role', 'status', 'createdAt'];
    } else if (entity === 'communities') {
      const communities = await this.communityRepo.find({ select: ['id', 'name', 'status', 'createdAt'] });
      rows = communities.map((c) => ({ id: c.id, name: c.name, status: c.status, createdAt: c.createdAt }));
      headers = ['id', 'name', 'status', 'createdAt'];
    } else if (entity === 'posts') {
      const posts = await this.postRepo.find({ select: ['id', 'title', 'createdAt'] });
      rows = posts.map((p) => ({ id: p.id, title: p.title, createdAt: p.createdAt }));
      headers = ['id', 'title', 'createdAt'];
    } else {
      throw new BadRequestException(`Unknown entity: ${entity}. Use: users, communities, posts`);
    }

    const escape = (val: unknown) => `"${String(val ?? '').replace(/"/g, '""')}"`;
    const csvLines = [
      headers.join(','),
      ...rows.map((row) => headers.map((h) => escape(row[h])).join(',')),
    ];
    return csvLines.join('\n');
  }
}
