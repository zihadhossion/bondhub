import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommentEntity } from './entities/comment.entity';
import { CreateCommentDto } from './dtos/create-comment.dto';
import { PaginatedResult } from '../../core/base/base.repository';
import { PostEntity } from '../posts/entities/post.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationTypeEnum } from '../../shared/enums/notification-type.enum';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(CommentEntity)
    private readonly commentRepository: Repository<CommentEntity>,
    @InjectRepository(PostEntity)
    private readonly postRepository: Repository<PostEntity>,
    private readonly notificationsService: NotificationsService,
  ) {}

  async getComments(postId: string, page: number, limit: number): Promise<PaginatedResult<CommentEntity>> {
    const skip = (page - 1) * limit;
    const [data, totalItems] = await this.commentRepository.findAndCount({
      where: { postId },
      relations: ['author'],
      order: { createdAt: 'ASC' },
      skip,
      take: limit,
    });
    return { data, meta: { page, limit, totalItems, totalPages: Math.ceil(totalItems / limit) } };
  }

  async create(postId: string, dto: CreateCommentDto, authorId: string): Promise<CommentEntity> {
    const comment = this.commentRepository.create({
      content: dto.content,
      postId,
      authorId,
    });
    const saved = await this.commentRepository.save(comment);

    const post = await this.postRepository.findOne({ where: { id: postId }, relations: ['author'] });
    if (post && post.authorId !== authorId) {
      await this.notificationsService.createNotification({
        userId: post.authorId,
        type: NotificationTypeEnum.new_comment,
        title: 'New comment on your post',
        message: `Someone commented on your post "${post.title}"`,
        relatedPostId: postId,
        relatedUserId: authorId,
      });
    }

    return this.commentRepository.findOne({
      where: { id: saved.id },
      relations: ['author'],
    }) as Promise<CommentEntity>;
  }

  async delete(commentId: string, userId: string): Promise<void> {
    const comment = await this.commentRepository.findOne({ where: { id: commentId } });
    if (!comment) throw new NotFoundException('Comment not found!');
    if (comment.authorId !== userId) {
      throw new ForbiddenException('You do not have permission to delete this comment!');
    }
    await this.commentRepository.softRemove(comment);
  }
}
