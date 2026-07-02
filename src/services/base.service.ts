import type { FilterQuery, Model, UpdateQuery } from 'mongoose';
import { QueryBuilder, type QueryBuilderOptions } from '@/utils/QueryBuilder';
import { NotFoundError } from '@/utils/AppError';
import type { PaginatedResult } from '@/types/common.types';
import type { SoftDeleteMethods, SoftDeleteModel } from '@/database/plugins/softDelete.plugin';

export abstract class BaseService<T> {
  protected readonly model: Model<T>;
  protected readonly resourceName: string;

  constructor(model: Model<T>, resourceName = 'Resource') {
    this.model = model;
    this.resourceName = resourceName;
  }

  async create(payload: Partial<T>): Promise<T> {
    const doc = await this.model.create(payload as T);
    return doc as T;
  }

  async findAll(
    query: Record<string, unknown>,
    options: QueryBuilderOptions = {},
  ): Promise<PaginatedResult<T>> {
    return new QueryBuilder<T>(this.model, query, options).paginateResults();
  }

  async findById(id: string): Promise<T> {
    const doc = await this.model.findById(id);
    if (!doc) throw new NotFoundError(`${this.resourceName} not found`);
    return doc as T;
  }

  async findOne(filter: FilterQuery<T>): Promise<T | null> {
    return this.model.findOne(filter) as Promise<T | null>;
  }

  async updateById(id: string, update: UpdateQuery<T>): Promise<T> {
    const doc = await this.model.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    });
    if (!doc) throw new NotFoundError(`${this.resourceName} not found`);
    return doc as T;
  }

  async softDeleteById(id: string, deletedBy?: string): Promise<T> {
    const doc = await this.model.findById(id);
    if (!doc) throw new NotFoundError(`${this.resourceName} not found`);
    await (doc as unknown as SoftDeleteMethods).softDelete(deletedBy);
    return doc as T;
  }

  async restoreById(id: string): Promise<T> {
    const model = this.model as unknown as SoftDeleteModel<T>;
    const doc = await model.findOneWithDeleted({ _id: id } as FilterQuery<T>);
    if (!doc) throw new NotFoundError(`${this.resourceName} not found`);
    await (doc as unknown as SoftDeleteMethods).restore();
    return doc as T;
  }


  async hardDeleteById(id: string): Promise<void> {
    const doc = await this.model.findByIdAndDelete(id);
    if (!doc) throw new NotFoundError(`${this.resourceName} not found`);
  }

  async count(filter: FilterQuery<T> = {}): Promise<number> {
    return this.model.countDocuments(filter);
  }
}