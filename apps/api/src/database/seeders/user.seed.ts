import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import { UserEntity } from '../../modules/users/entities/user.entity';
import { RoleEnum } from '../../shared/enums/role.enum';
import { UserStatusEnum } from '../../shared/enums/user-status.enum';

interface UserFixture {
  email: string;
  password: string;
  role: string;
  displayName: string;
  bio?: string;
}

interface Fixtures {
  users: UserFixture[];
}

export async function seedUsers(dataSource: DataSource): Promise<UserEntity[]> {
  const repo = dataSource.getRepository(UserEntity);

  // Read credentials from _fixtures.yaml (Single Source of Truth)
  const fixturesPath = path.join(
    __dirname,
    '../../../../.claude-project/user_stories/_fixtures.yaml',
  );
  const fixturesContent = fs.readFileSync(fixturesPath, 'utf-8');
  const fixtures = yaml.load(fixturesContent) as Fixtures;

  const seeded: UserEntity[] = [];

  for (const fixture of fixtures.users) {
    const existing = await repo.findOne({ where: { email: fixture.email } });
    if (existing) {
      console.log(`[user.seed] Skipping existing user: ${fixture.email}`);
      seeded.push(existing);
      continue;
    }

    const passwordHash = await bcrypt.hash(fixture.password, 10);
    const user = repo.create({
      email: fixture.email,
      password: passwordHash,
      displayName: fixture.displayName,
      bio: fixture.bio || null,
      role: fixture.role === 'admin' ? RoleEnum.admin : RoleEnum.user,
      status: UserStatusEnum.active,
    });

    const saved = await repo.save(user);
    console.log(`[user.seed] Created user: ${fixture.email} (${fixture.role})`);
    seeded.push(saved);
  }

  return seeded;
}
