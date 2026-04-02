import {
  Entity,
  Column,
  Index,
  OneToMany,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { BaseEntity } from '../../../core/base/base.entity';
import { RoleEnum } from '../../../shared/enums/role.enum';
import { UserStatusEnum } from '../../../shared/enums/user-status.enum';
import { PostEntity } from '../../posts/entities/post.entity';
import { CommentEntity } from '../../comments/entities/comment.entity';
import { CommunityMemberEntity } from '../../communities/entities/community-member.entity';
import { FollowEntity } from './follow.entity';
import { FlagEntity } from '../../flags/entities/flag.entity';
import { NotificationEntity } from '../../notifications/entities/notification.entity';

@Entity('users')
export class UserEntity extends BaseEntity {
  @Index({ unique: true })
  @Column({ name: 'email', type: 'varchar', length: 255, unique: true })
  email: string;

  @Exclude()
  @Column({ name: 'password', type: 'varchar', length: 255 })
  password: string;

  @Column({ name: 'display_name', type: 'varchar', length: 100 })
  displayName: string;

  @Column({ name: 'bio', type: 'text', nullable: true })
  bio: string | null;

  @Column({ name: 'profile_picture', type: 'varchar', length: 255, nullable: true })
  profilePicture: string | null;

  @Index()
  @Column({
    name: 'role',
    type: 'enum',
    enum: RoleEnum,
    default: RoleEnum.user,
  })
  role: RoleEnum;

  @Index()
  @Column({
    name: 'status',
    type: 'enum',
    enum: UserStatusEnum,
    default: UserStatusEnum.active,
  })
  status: UserStatusEnum;

  @Column({ name: 'last_login_at', type: 'timestamp', nullable: true })
  lastLoginAt: Date | null;

  @Exclude()
  @Column({ name: 'refresh_token_hash', type: 'varchar', length: 255, nullable: true })
  refreshTokenHash: string | null;

  @Exclude()
  @Column({ name: 'reset_password_token', type: 'varchar', length: 255, nullable: true })
  resetPasswordToken: string | null;

  @Exclude()
  @Column({ name: 'reset_password_expires', type: 'timestamp', nullable: true })
  resetPasswordExpires: Date | null;

  @OneToMany(() => PostEntity, (post) => post.author)
  posts: PostEntity[];

  @OneToMany(() => CommentEntity, (comment) => comment.author)
  comments: CommentEntity[];

  @OneToMany(() => CommunityMemberEntity, (member) => member.user)
  communityMemberships: CommunityMemberEntity[];

  @OneToMany(() => FollowEntity, (follow) => follow.follower)
  following: FollowEntity[];

  @OneToMany(() => FollowEntity, (follow) => follow.following)
  followers: FollowEntity[];

  @OneToMany(() => FlagEntity, (flag) => flag.flaggedBy)
  flags: FlagEntity[];

  @OneToMany(() => NotificationEntity, (notification) => notification.user)
  notifications: NotificationEntity[];
}
