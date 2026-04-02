import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../core/base/base.entity';
import { NotificationTypeEnum } from '../../../shared/enums/notification-type.enum';
import { UserEntity } from '../../users/entities/user.entity';

@Entity('notifications')
export class NotificationEntity extends BaseEntity {
  @Index()
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Index()
  @Column({
    name: 'type',
    type: 'enum',
    enum: NotificationTypeEnum,
  })
  type: NotificationTypeEnum;

  @Column({ name: 'title', type: 'varchar' })
  title: string;

  @Column({ name: 'message', type: 'varchar' })
  message: string;

  @Column({ name: 'related_user_id', type: 'uuid', nullable: true })
  relatedUserId: string | null;

  @Column({ name: 'related_post_id', type: 'uuid', nullable: true })
  relatedPostId: string | null;

  @Index()
  @Column({ name: 'is_read', type: 'boolean', default: false })
  isRead: boolean;

  @ManyToOne(() => UserEntity, (user) => user.notifications, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;
}
