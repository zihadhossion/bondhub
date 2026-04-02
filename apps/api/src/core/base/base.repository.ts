import { Repository, FindManyOptions, FindOneOptions, DeepPartial, ObjectLiteral } from 'typeorm';

export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
}

export class BaseRepository<T extends ObjectLiteral> {
  constructor(protected readonly repository: Repository<T>) {}

  async findById(id: string): Promise<T | null> {
    return this.repository.findOne({ where: { id } as unknown as FindOneOptions<T>['where'] });
  }

  async findOne(options: FindOneOptions<T>): Promise<T | null> {
    return this.repository.findOne(options);
  }

  async findAll(options?: FindManyOptions<T>): Promise<T[]> {
    return this.repository.find(options);
  }

  async count(options?: FindManyOptions<T>): Promise<number> {
    return this.repository.count(options);
  }

  async create(data: DeepPartial<T>): Promise<T> {
    const entity = this.repository.create(data);
    return this.repository.save(entity as T);
  }

  async save(entity: T): Promise<T> {
    return this.repository.save(entity);
  }

  async update(entity: T, data: Partial<T>): Promise<T> {
    Object.assign(entity, data);
    return this.repository.save(entity);
  }

  async softDelete(entity: T): Promise<T> {
    return this.repository.softRemove(entity);
  }

  async hardDelete(entity: T): Promise<void> {
    await this.repository.remove(entity);
  }

  async paginate(
    page: number,
    limit: number,
    options?: FindManyOptions<T>,
  ): Promise<PaginatedResult<T>> {
    const skip = (page - 1) * limit;
    const [data, totalItems] = await this.repository.findAndCount({
      ...options,
      skip,
      take: limit,
    });
    const totalPages = Math.ceil(totalItems / limit);
    return { data, meta: { page, limit, totalItems, totalPages } };
  }

  getRepository(): Repository<T> {
    return this.repository;
  }
}
