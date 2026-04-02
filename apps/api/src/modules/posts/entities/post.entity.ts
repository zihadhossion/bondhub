import {
  Entity,
  Column,
  Index,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { BaseEntity } from '../../../core/base/base.entity';
import { UserEntity } from '../../users/entities/user.entity';
import { CommunityEntity } from '../../communities/entities/community.entity';
import { CommentEntity } from '../../comments/entities/comment.entity';

@Entity('posts')
export class PostEntity extends BaseEntity {
  @Column({ name: 'title', type: 'varchar', length: 100 })
  title: string;

  @Column({ name: 'content', type: 'varchar', length: 300 })
  content: string;

  @Index()
  @Column({ name: 'author_id', type: 'uuid' })
  authorId: string;

  @Index()
  @Column({ name: 'community_id', type: 'uuid' })
  communityId: string;

  @ManyToOne(() => UserEntity, (user) => user.posts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'author_id' })
  author: UserEntity;

  @ManyToOne(() => CommunityEntity, (community) => community.posts, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'community_id' })
  community: CommunityEntity;

  @OneToMany(() => CommentEntity, (comment) => comment.post)
  comments: CommentEntity[];
}
