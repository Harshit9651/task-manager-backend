import type { SchemaOptions } from 'mongoose';


export const baseSchemaOptions: SchemaOptions = {
  timestamps: true,
  versionKey: false,
  toJSON: {
    virtuals: true,
    transform: (_doc, ret: Record<string, unknown>) => {
      ret.id = ret._id;
      delete ret._id;
      return ret;
    },
  },
  toObject: { virtuals: true },
};