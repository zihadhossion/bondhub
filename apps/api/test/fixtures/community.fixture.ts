import { DataSource } from 'typeorm';
import { CategoryEntity } from '../../src/modules/categories/entities/category.entity';
import { CommunityEntity } from '../../src/modules/communities/entities/community.entity';
import { CommunityMemberEntity } from '../../src/modules/communities/entities/community-member.entity';
import { CommunityStatusEnum } from '../../src/shared/enums/community-status.enum';

export async function createTestCategory(ds: DataSource): Promise<CategoryEntity> {
  const repo = ds.getRepository(CategoryEntity);
  const existing = await repo.findOne({ where: { name: 'Test Category' } });
  if (existing) return existing;
  return repo.save(repo.create({ name: 'Test Category', description: 'Category for E2E testing' }));
}

export async function createTestCommunity(
  ds: DataSource,
  categoryId: string,
  createdById: string,
): Promise<CommunityEntity> {
  const repo = ds.getRepository(CommunityEntity);
  const existing = await repo.findOne({ where: { name: 'Test Community' } });
  if (existing) return existing;
  return repo.save(
    repo.create({
      name: 'Test Community',
      description: 'Community for E2E testing',
      categoryId,
      createdById,
      status: CommunityStatusEnum.active,
    }),
  );
}

export async function addCommunityMember(
  ds: DataSource,
  userId: string,
  communityId: string,
): Promise<CommunityMemberEntity> {
  const repo = ds.getRepository(CommunityMemberEntity);
  const existing = await repo.findOne({ where: { userId, communityId } });
  if (existing) return existing;
  return repo.save(repo.create({ userId, communityId }));
}
