import { DataSource } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import { CommunityEntity } from '../../modules/communities/entities/community.entity';
import { CommunityMemberEntity } from '../../modules/communities/entities/community-member.entity';
import { UserEntity } from '../../modules/users/entities/user.entity';
import { CategoryEntity } from '../../modules/categories/entities/category.entity';
import { CommunityStatusEnum } from '../../shared/enums/community-status.enum';

interface CommunityFixture {
  name: string;
  category: string;
  description: string;
}

interface MemberFixture {
  user: string;
  community: string;
}

interface Fixtures {
  communities: CommunityFixture[];
  community_members?: MemberFixture[];
}

export async function seedCommunities(
  dataSource: DataSource,
  users: UserEntity[],
  categories: CategoryEntity[],
): Promise<CommunityEntity[]> {
  const communityRepo = dataSource.getRepository(CommunityEntity);
  const memberRepo = dataSource.getRepository(CommunityMemberEntity);

  const fixturesPath = path.join(
    __dirname,
    '../../../../.claude-project/user_stories/_fixtures.yaml',
  );
  const fixturesContent = fs.readFileSync(fixturesPath, 'utf-8');
  const fixtures = yaml.load(fixturesContent) as Fixtures;

  const seeded: CommunityEntity[] = [];
  const adminUser = users.find((u) => u.email === 'admin@bondhub.com') || users[0];

  // Seed communities
  for (const fixture of fixtures.communities) {
    const existing = await communityRepo.findOne({ where: { name: fixture.name } });
    if (existing) {
      console.log(`[community.seed] Skipping existing community: ${fixture.name}`);
      seeded.push(existing);
      continue;
    }

    const category = categories.find((c) => c.name === fixture.category);
    if (!category) {
      console.warn(`[community.seed] Category not found: ${fixture.category}, skipping community ${fixture.name}`);
      continue;
    }

    const community = communityRepo.create({
      name: fixture.name,
      description: fixture.description,
      categoryId: category.id,
      createdById: adminUser.id,
      status: CommunityStatusEnum.active,
    });
    const saved = await communityRepo.save(community);
    console.log(`[community.seed] Created community: ${fixture.name}`);
    seeded.push(saved);
  }

  // Seed community memberships
  if (fixtures.community_members) {
    for (const memberFixture of fixtures.community_members) {
      const user = users.find((u) => u.email === memberFixture.user);
      const community = seeded.find((c) => c.name === memberFixture.community);

      if (!user || !community) {
        console.warn(`[community.seed] Skipping membership: ${memberFixture.user} → ${memberFixture.community}`);
        continue;
      }

      const existing = await memberRepo.findOne({
        where: { userId: user.id, communityId: community.id },
      });
      if (existing) {
        continue;
      }

      const member = memberRepo.create({ userId: user.id, communityId: community.id });
      await memberRepo.save(member);
      console.log(`[community.seed] Added member ${memberFixture.user} to ${memberFixture.community}`);
    }
  }

  return seeded;
}
