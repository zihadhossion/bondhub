import {
  Entity,
  Column,
  Index,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { BaseEntity } from '../../../core/base/base.entity';
import { CommunityStatusEnum } from '../../../shared/enums/community-status.enum';
import { CategoryEntity } from '../../categories/entities/category.entity';
import { CommunityMemberEntity } from './community-member.entity';
import { PostEntity } from '../../posts/entities/post.entity';
import { UserEntity } from '../../users/entities/user.entity';

@Entity('communities')
export class CommunityEntity extends BaseEntity {
  @Column({ name: 'name', type: 'varchar', length: 100 })
  name: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'cover_image', type: 'varchar', length: 255, nullable: true })
  coverImage: string | null;

  @Index()
  @Column({ name: 'category_id', type: 'uuid' })
  categoryId: string;

  @Column({ name: 'created_by_id', type: 'uuid', nullable: true })
  createdById: string | null;

  @Index()
  @Column({
    name: 'status',
    type: 'enum',
    enum: CommunityStatusEnum,
    default: CommunityStatusEnum.active,
  })
  status: CommunityStatusEnum;

  @ManyToOne(() => CategoryEntity, (category) => category.communities, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'category_id' })
  category: CategoryEntity;

  @ManyToOne(() => UserEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'created_by_id' })
  createdBy: UserEntity | null;

  @OneToMany(() => CommunityMemberEntity, (member) => member.community)
  members: CommunityMemberEntity[];

  @OneToMany(() => PostEntity, (post) => post.community)
  posts: PostEntity[];
}
