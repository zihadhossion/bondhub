import { Entity, PrimaryColumn, CreateDateColumn } from 'typeorm';

@Entity('post_likes')
export class PostLikeEntity {
  @PrimaryColumn({ name: 'user_id', type: 'uuid' })
  userId: string;

  @PrimaryColumn({ name: 'post_id', type: 'uuid' })
  postId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
