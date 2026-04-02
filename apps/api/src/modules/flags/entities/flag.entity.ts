import {
  Entity,
  Column,
  Index,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ContentTypeEnum } from '../../../shared/enums/content-type.enum';
import { FlagStatusEnum } from '../../../shared/enums/flag-status.enum';
import { UserEntity } from '../../users/entities/user.entity';

@Entity('flags')
@Index(['contentType', 'contentId'])
export class FlagEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    name: 'content_type',
    type: 'enum',
    enum: ContentTypeEnum,
  })
  contentType: ContentTypeEnum;

  @Column({ name: 'content_id', type: 'uuid' })
  contentId: string;

  @Index()
  @Column({ name: 'flagged_by_id', type: 'uuid' })
  flaggedById: string;

  @Index()
  @Column({
    name: 'status',
    type: 'enum',
    enum: FlagStatusEnum,
    default: FlagStatusEnum.pending,
  })
  status: FlagStatusEnum;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => UserEntity, (user) => user.flags, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'flagged_by_id' })
  flaggedBy: UserEntity;
}
