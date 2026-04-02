import { NotFoundException } from '@nestjs/common';
import { BaseRepository } from './base.repository';
import { ObjectLiteral, DeepPartial } from 'typeorm';

export class BaseService<T extends ObjectLiteral & { id: string }> {
  constructor(
    protected readonly repository: BaseRepository<T>,
    protected readonly entityName: string,
  ) {}

  async findByIdOrFail(id: string): Promise<T> {
    const entity = await this.repository.findById(id);
    if (!entity) {
      throw new NotFoundException(`${this.entityName} with id ${id} not found.`);
    }
    return entity;
  }

  async findAll(): Promise<T[]> {
    return this.repository.findAll();
  }

  async create(data: DeepPartial<T>): Promise<T> {
    return this.repository.create(data);
  }

  async update(id: string, data: Partial<T>): Promise<T> {
    const entity = await this.findByIdOrFail(id);
    return this.repository.update(entity, data);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findByIdOrFail(id);
    await this.repository.softDelete(entity);
  }
}
