import { DataSource } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import { CategoryEntity } from '../../modules/categories/entities/category.entity';

interface Fixtures {
  categories: { name: string }[];
}

export async function seedCategories(dataSource: DataSource): Promise<CategoryEntity[]> {
  const repo = dataSource.getRepository(CategoryEntity);

  const fixturesPath = path.join(
    __dirname,
    '../../../../.claude-project/user_stories/_fixtures.yaml',
  );
  const fixturesContent = fs.readFileSync(fixturesPath, 'utf-8');
  const fixtures = yaml.load(fixturesContent) as Fixtures;

  const seeded: CategoryEntity[] = [];

  for (const fixture of fixtures.categories) {
    const existing = await repo.findOne({ where: { name: fixture.name } });
    if (existing) {
      console.log(`[category.seed] Skipping existing category: ${fixture.name}`);
      seeded.push(existing);
      continue;
    }

    const category = repo.create({ name: fixture.name, description: null });
    const saved = await repo.save(category);
    console.log(`[category.seed] Created category: ${fixture.name}`);
    seeded.push(saved);
  }

  return seeded;
}
