// src/utils/QueryBuilder.ts
import type { FilterQuery, Model, SortOrder } from 'mongoose';
import type { PaginatedResult, PaginationMeta } from '@/types/common.types';

const RESERVED_FIELDS = ['page', 'limit', 'sort', 'fields', 'search'] as const;

const OPERATOR_MAP: Record<string, string> = {
  gte: '$gte',
  gt: '$gt',
  lte: '$lte',
  lt: '$lt',
  ne: '$ne',
  eq: '$eq',
  in: '$in',
  nin: '$nin',
};

export interface QueryBuilderOptions {

  searchableFields?: string[];
  defaultLimit?: number;
  maxLimit?: number;
  defaultSort?: string;
}

const isReserved = (key: string): boolean => (RESERVED_FIELDS as readonly string[]).includes(key);

const addOperator = (
  target: Record<string, unknown>,
  field: string,
  op: string,
  value: unknown,
): void => {
  const mongoOp = OPERATOR_MAP[op];
  if (!mongoOp) return;
  const existing =
    target[field] && typeof target[field] === 'object' && !Array.isArray(target[field])
      ? (target[field] as Record<string, unknown>)
      : {};
  const parsed =
    op === 'in' || op === 'nin'
      ? String(value)
          .split(',')
          .map((v) => v.trim())
          .filter(Boolean)
      : String(value);
  target[field] = { ...existing, [mongoOp]: parsed };
};

const parseSort = (sortParam: string): Record<string, SortOrder> => {
  const sortObj: Record<string, SortOrder> = {};
  for (const field of sortParam.split(',').map((s) => s.trim()).filter(Boolean)) {
    if (field.startsWith('-')) sortObj[field.slice(1)] = -1;
    else sortObj[field] = 1;
  }
  return Object.keys(sortObj).length ? sortObj : { createdAt: -1 };
};

export class QueryBuilder<T> {
  private readonly model: Model<T>;
  private readonly rawQuery: Record<string, unknown>;
  private readonly options: Required<QueryBuilderOptions>;
  private filterConditions: FilterQuery<T> = {};
  private mongoQuery!: ReturnType<Model<T>['find']>;
  private page = 1;
  private limit: number;

  constructor(model: Model<T>, rawQuery: Record<string, unknown>, options: QueryBuilderOptions = {}) {
    this.model = model;
    this.rawQuery = rawQuery ?? {};
    this.options = {
      searchableFields: options.searchableFields ?? [],
      defaultLimit: options.defaultLimit ?? 10,
      maxLimit: options.maxLimit ?? 100,
      defaultSort: options.defaultSort ?? '-createdAt',
    };
    this.limit = this.options.defaultLimit;
  }

  filter(): this {
    const conditions: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(this.rawQuery)) {
      if (isReserved(key) || value === undefined || value === null || value === '') continue;

  
      const bracket = key.match(/^(.+)\[(gte|gt|lte|lt|ne|eq|in|nin)\]$/);
      if (bracket) {
        addOperator(conditions, bracket[1], bracket[2], value);
        continue;
      }

   
      if (Array.isArray(value)) {
        conditions[key] = { $in: value.map(String) };
        continue;
      }

      
      if (typeof value === 'object') {
        for (const [op, opVal] of Object.entries(value as Record<string, unknown>)) {
          addOperator(conditions, key, op, opVal);
        }
        continue;
      }

      conditions[key] = String(value);
    }

    this.filterConditions = { ...this.filterConditions, ...conditions } as FilterQuery<T>;
    return this;
  }

  search(): this {
    const term = this.rawQuery.search;
    const { searchableFields } = this.options;
    if (typeof term === 'string' && term.trim() && searchableFields.length) {
      const regex = { $regex: term.trim(), $options: 'i' };
      (this.filterConditions as Record<string, unknown>).$or = searchableFields.map((field) => ({
        [field]: regex,
      }));
    }
    return this;
  }

  private build(): this {
    this.mongoQuery = this.model.find(this.filterConditions);
    return this;
  }

  private sort(): this {
    const sortParam = (this.rawQuery.sort as string | undefined) || this.options.defaultSort;
    this.mongoQuery = this.mongoQuery.sort(parseSort(sortParam));
    return this;
  }

  private selectFields(): this {
    const fields = this.rawQuery.fields as string | undefined;
    this.mongoQuery = fields
      ? this.mongoQuery.select(fields.split(',').map((f) => f.trim()).join(' '))
      : this.mongoQuery;
    return this;
  }

  private paginate(): this {
    const page = Math.max(1, Number(this.rawQuery.page) || 1);
    const requested = Number(this.rawQuery.limit) || this.options.defaultLimit;
    const limit = Math.min(Math.max(1, requested), this.options.maxLimit);
    this.page = page;
    this.limit = limit;
    this.mongoQuery = this.mongoQuery.skip((page - 1) * limit).limit(limit);
    return this;
  }

  async paginateResults(): Promise<PaginatedResult<T>> {
    this.filter().search().build().sort().selectFields().paginate();

    const [results, total] = await Promise.all([
      this.mongoQuery.exec() as Promise<T[]>,
      this.model.countDocuments(this.filterConditions),
    ]);

    const totalPages = Math.max(1, Math.ceil(total / this.limit));
    const meta: PaginationMeta = {
      total,
      page: this.page,
      limit: this.limit,
      totalPages,
      hasNextPage: this.page < totalPages,
      hasPrevPage: this.page > 1,
    };

    return { results, meta };
  }
}