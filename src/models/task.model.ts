import { Schema, model, type Document } from 'mongoose';
import {
  softDeletePlugin,
  type SoftDeleteMethods,
  type SoftDeleteModel,
} from '@/database/plugins/softDelete.plugin';
import {
  ISO_DATE_REGEX,
  TASK_DEFAULTS,
  TASK_PRIORITIES,
  TASK_STATUSES,
  todayISODate,
} from '@/constants/task.constants';
import type { ITask } from '@/interfaces/task.interface';

export interface ITaskDocument extends ITask, Document, SoftDeleteMethods {}

const taskSchema = new Schema<ITaskDocument>(
  {

    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },

    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, trim: true, maxlength: 2000 },
    dueTime: { type: String, trim: true, maxlength: 40 },

    priority: { type: String, enum: [...TASK_PRIORITIES], default: TASK_DEFAULTS.priority },
    tag: { type: String, trim: true, maxlength: 40, default: TASK_DEFAULTS.tag },
    status: { type: String, enum: [...TASK_STATUSES], default: TASK_DEFAULTS.status },
    date: {
      type: String,
      required: true,
      default: todayISODate,
      match: [ISO_DATE_REGEX, 'date must be in YYYY-MM-DD format'],
    },

    completedAt: { type: Date, default: null },
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

// Keep completedAt in sync with status on every save.
taskSchema.pre('save', function syncCompletedAt(next) {
  if (this.isModified('status')) {
    this.completedAt = this.status === 'completed' ? new Date() : null;
  }
  next();
});

taskSchema.plugin(softDeletePlugin);

// Compound indexes — every query filters by user.
taskSchema.index({ user: 1, date: -1 }); // Today / History listing by day
taskSchema.index({ user: 1, status: 1 });
taskSchema.index({ user: 1, priority: 1 });

export const TaskModel = model<ITaskDocument>('Task', taskSchema) as SoftDeleteModel<ITaskDocument>;