import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from '../../core/base/base.repository';
import { CategoryEntity } from './entities/category.entity';

@Injectable()
export class CategoriesRepository extends BaseRepository<CategoryEntity> {
  constructor(
    @InjectRepository(CategoryEntity)
    repository: Repository<CategoryEntity>,
  ) {
    super(repository);
  }

  async findAllWithCommunitiesCount(): Promise<Array<CategoryEntity & { communitiesCount: number }>> {
    const result = await this.repository
      .createQueryBuilder('category')
      .leftJoin('category.communities', 'community', 'community.deleted_at IS NULL')
      .addSelect('COUNT(community.id)', 'communitiesCount')
      .groupBy('category.id')
      .getRawAndEntities();

    return result.entities.map((entity, i) => ({
      ...entity,
      communitiesCount: parseInt(result.raw[i]?.communitiesCount ?? '0', 10),
    }));
  }
}
