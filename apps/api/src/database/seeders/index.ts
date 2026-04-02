import 'reflect-metadata';
import * as bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { UserEntity } from '../../modules/users/entities/user.entity';
import { RoleEnum } from '../../shared/enums/role.enum';
import { UserStatusEnum } from '../../shared/enums/user-status.enum';

dotenv.config({ path: path.join(__dirname, '../../../.env') });

if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
  throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD environment variables are required');
}

const ADMIN_EMAIL = process.env.ADMIN_EMAIL as string;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD as string;
const ADMIN_DISPLAY_NAME = process.env.ADMIN_DISPLAY_NAME ?? 'Admin';

const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [UserEntity],
  synchronize: false,
  logging: false,
});

async function runSeeders() {
  await AppDataSource.initialize();

  const repo = AppDataSource.getRepository(UserEntity);
  const existing = await repo.findOne({ where: { email: ADMIN_EMAIL } });

  if (existing) {
    console.log(`[seed] Admin already exists: ${ADMIN_EMAIL}`);
  } else {
    const hash = await bcrypt.hash(ADMIN_PASSWORD, 10);
    const admin = repo.create({
      email: ADMIN_EMAIL,
      password: hash,
      displayName: ADMIN_DISPLAY_NAME,
      bio: null,
      profilePicture: null,
      role: RoleEnum.admin,
      status: UserStatusEnum.active,
    });
    await repo.save(admin);
    console.log(`[seed] Admin created: ${ADMIN_EMAIL}`);
  }

  await AppDataSource.destroy();
}

runSeeders().catch((err) => {
  console.error(err);
  process.exit(1);
});
