import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { CategoriesRepository } from './categories.repository';
import { CategoryEntity } from './entities/category.entity';
import { CreateCategoryDto } from './dtos/create-category.dto';
import { UpdateCategoryDto } from './dtos/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly categoriesRepository: CategoriesRepository) {}

  async findAll(): Promise<Array<CategoryEntity & { communitiesCount: number }>> {
    return this.categoriesRepository.findAllWithCommunitiesCount();
  }

  async findById(id: string): Promise<CategoryEntity> {
    const category = await this.categoriesRepository.findById(id);
    if (!category) {
      throw new NotFoundException('Category not found!');
    }
    return category;
  }

  async create(dto: CreateCategoryDto): Promise<CategoryEntity> {
    const existing = await this.categoriesRepository.findOne({ where: { name: dto.name } });
    if (existing) {
      throw new ConflictException('A category with this name already exists!');
    }
    return this.categoriesRepository.create(dto);
  }

  async update(id: string, dto: UpdateCategoryDto): Promise<CategoryEntity> {
    const category = await this.findById(id);
    if (dto.name && dto.name !== category.name) {
      const existing = await this.categoriesRepository.findOne({ where: { name: dto.name } });
      if (existing) {
        throw new ConflictException('A category with this name already exists!');
      }
    }
    return this.categoriesRepository.update(category, dto as Partial<CategoryEntity>);
  }

  async delete(id: string): Promise<void> {
    const category = await this.findById(id);
    const communitiesCount = await this.categoriesRepository
      .getRepository()
      .createQueryBuilder('category')
      .leftJoin('category.communities', 'community', 'community.deleted_at IS NULL')
      .where('category.id = :id', { id })
      .getCount();

    if (communitiesCount > 0) {
      throw new BadRequestException('Cannot delete category that has active communities assigned!');
    }
    await this.categoriesRepository.hardDelete(category);
  }
}
