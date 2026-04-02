import {
  Entity,
  Column,
  Index,
  OneToMany,
} from 'typeorm';
import { BaseEntity } from '../../../core/base/base.entity';
import { CommunityEntity } from '../../communities/entities/community.entity';

@Entity('categories')
export class CategoryEntity extends BaseEntity {
  @Index({ unique: true })
  @Column({ name: 'name', type: 'varchar', length: 50, unique: true })
  name: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description: string | null;

  @OneToMany(() => CommunityEntity, (community) => community.category)
  communities: CommunityEntity[];
}
