import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationEntity } from './entities/notification.entity';
import { NotificationTypeEnum } from '../../shared/enums/notification-type.enum';
import { PaginatedResult } from '../../core/base/base.repository';

export interface CreateNotificationDto {
  userId: string;
  type: NotificationTypeEnum;
  title: string;
  message: string;
  relatedUserId?: string;
  relatedPostId?: string;
}

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(NotificationEntity)
    private readonly notificationRepository: Repository<NotificationEntity>,
  ) {}

  async createNotification(dto: CreateNotificationDto): Promise<void> {
    const notification = this.notificationRepository.create({
      userId: dto.userId,
      type: dto.type,
      title: dto.title,
      message: dto.message,
      relatedUserId: dto.relatedUserId ?? null,
      relatedPostId: dto.relatedPostId ?? null,
      isRead: false,
    });
    await this.notificationRepository.save(notification);
  }

  async getNotifications(
    userId: string,
    page: number,
    limit: number,
  ): Promise<PaginatedResult<NotificationEntity>> {
    const skip = (page - 1) * limit;
    const [data, totalItems] = await this.notificationRepository.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });
    const totalPages = Math.ceil(totalItems / limit);
    return { data, meta: { page, limit, totalItems, totalPages } };
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationRepository.count({
      where: { userId, isRead: false },
    });
  }

  async markAsRead(id: string, userId: string): Promise<NotificationEntity> {
    const notification = await this.notificationRepository.findOne({ where: { id } });
    if (!notification) {
      throw new NotFoundException('Notification not found');
    }
    if (notification.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }
    notification.isRead = true;
    return this.notificationRepository.save(notification);
  }

  async markAllAsRead(userId: string): Promise<{ message: string }> {
    await this.notificationRepository.update({ userId, isRead: false }, { isRead: true });
    return { message: 'All notifications marked as read' };
  }

  async deleteNotification(id: string, userId: string): Promise<void> {
    const notification = await this.notificationRepository.findOne({ where: { id } });
    if (!notification) {
      throw new NotFoundException('Notification not found');
    }
    if (notification.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }
    await this.notificationRepository.softRemove(notification);
  }
}
