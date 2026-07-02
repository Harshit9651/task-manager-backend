import { Schema, type FilterQuery, type Model, type Query } from 'mongoose';

export interface SoftDeleteFields {
  isDeleted: boolean;
  deletedAt: Date | null;
  deletedBy?: string | null;
}

export interface SoftDeleteMethods {
  softDelete(deletedBy?: string): Promise<void>;
  restore(): Promise<void>;
}

export interface SoftDeleteModel<T> extends Model<T> {
  findWithDeleted(filter?: FilterQuery<T>): Query<T[], T>;
  findOneWithDeleted(filter?: FilterQuery<T>): Query<T | null, T>;
  findDeleted(filter?: FilterQuery<T>): Query<T[], T>;
}

const GUARDED_HOOKS = [
  'find',
  'findOne',
  'findOneAndUpdate',
  'countDocuments',
  'updateMany',
  'updateOne',
] as const;

export const softDeletePlugin = (schema: Schema): void => {
  schema.add({
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date, default: null },
    deletedBy: { type: String, default: null },
  });

  // Auto-filter out deleted docs unless the query opts in with { withDeleted: true }.
  function excludeDeleted(this: Query<unknown, unknown>): void {
    const options = this.getOptions();
    if (options.withDeleted === true) return;

    const filter = this.getFilter();
    if (filter.isDeleted === undefined) {
      void this.where({ isDeleted: { $ne: true } });
    }
  }

  for (const hook of GUARDED_HOOKS) {
    schema.pre(hook, excludeDeleted);
  }

  schema.methods.softDelete = async function (deletedBy?: string): Promise<void> {
    this.isDeleted = true;
    this.deletedAt = new Date();
    if (deletedBy) this.deletedBy = deletedBy;
    await this.save();
  };

  schema.methods.restore = async function (): Promise<void> {
    this.isDeleted = false;
    this.deletedAt = null;
    this.deletedBy = null;
    await this.save();
  };

  schema.statics.findWithDeleted = function (filter: FilterQuery<unknown> = {}) {
    return this.find(filter).setOptions({ withDeleted: true });
  };

  schema.statics.findOneWithDeleted = function (filter: FilterQuery<unknown> = {}) {
    return this.findOne(filter).setOptions({ withDeleted: true });
  };

  schema.statics.findDeleted = function (filter: FilterQuery<unknown> = {}) {
    return this.find({ ...filter, isDeleted: true }).setOptions({ withDeleted: true });
  };
};