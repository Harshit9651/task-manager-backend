import { Schema, model, type Document } from 'mongoose';
import { baseSchemaOptions } from '@/database/schema.options';
import {
  softDeletePlugin,
  type SoftDeleteMethods,
  type SoftDeleteModel,
} from '@/database/plugins/softDelete.plugin';
import type { IBoard } from '@/interfaces/board.interface';

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export interface IBoardDocument extends IBoard, Document, SoftDeleteMethods {}

const boardSchema = new Schema<IBoardDocument>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    boardDate: {
      type: String,
      required: true,
      match: [ISO_DATE_REGEX, 'boardDate must be in YYYY-MM-DD format'],
    },
    snapshot: { type: Schema.Types.Mixed, default: null },
    thumbnail: { type: String, default: null },
  },
  {
 
    toJSON: {
      virtuals: false,
      transform: (_doc, ret: Record<string, unknown>) => {
        ret._id = String(ret._id);
        if (ret.user) ret.user = String(ret.user);
        delete ret.id;
        delete ret.isDeleted;
        delete ret.deletedAt;
        delete ret.deletedBy;
        return ret;
      },
    },
  },
);

boardSchema.plugin(softDeletePlugin);
boardSchema.index({ user: 1, updatedAt: -1 });
boardSchema.index({ user: 1, boardDate: -1 });

export const BoardModel = model<IBoardDocument>('Board', boardSchema) as SoftDeleteModel<IBoardDocument>;