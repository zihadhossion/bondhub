import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserEntity } from '../../src/modules/users/entities/user.entity';
import { RoleEnum } from '../../src/shared/enums/role.enum';
import { UserStatusEnum } from '../../src/shared/enums/user-status.enum';

export interface TestUserData {
  email: string;
  password: string;
  displayName: string;
  role?: RoleEnum;
}

export const testUsers = {
  user: {
    email: 'user@bondhub.test',
    password: 'TestUser@1',
    displayName: 'Test User',
    role: RoleEnum.user,
  },
  admin: {
    email: 'admin@bondhub.test',
    password: 'AdminUser@1',
    displayName: 'Test Admin',
    role: RoleEnum.admin,
  },
};

export async function createTestUser(
  ds: DataSource,
  data: TestUserData,
): Promise<UserEntity> {
  const repo = ds.getRepository(UserEntity);
  const existing = await repo.findOne({ where: { email: data.email } });
  if (existing) return existing;

  const hash = await bcrypt.hash(data.password, 10);
  const user = repo.create({
    email: data.email,
    password: hash,
    displayName: data.displayName,
    role: data.role ?? RoleEnum.user,
    status: UserStatusEnum.active,
  });
  return repo.save(user);
}

export async function seedTestUsers(
  ds: DataSource,
): Promise<{ user: UserEntity; admin: UserEntity }> {
  const user = await createTestUser(ds, testUsers.user);
  const admin = await createTestUser(ds, testUsers.admin);
  return { user, admin };
}
