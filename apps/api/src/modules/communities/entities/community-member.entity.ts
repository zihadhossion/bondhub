import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
  CreateDateColumn,
} from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';
import { CommunityEntity } from './community.entity';

@Entity('community_members')
@Unique(['userId', 'communityId'])
export class CommunityMemberEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Index()
  @Column({ name: 'community_id', type: 'uuid' })
  communityId: string;

  @CreateDateColumn({ name: 'joined_at' })
  joinedAt: Date;

  @ManyToOne(() => UserEntity, (user) => user.communityMemberships, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @ManyToOne(() => CommunityEntity, (community) => community.members, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'community_id' })
  community: CommunityEntity;
}
