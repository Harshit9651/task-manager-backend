import { Types, type FilterQuery, type UpdateQuery } from 'mongoose';
import { BaseService } from '@/services/base.service';
import { TaskModel, type ITaskDocument } from '@/models/task.model';
import { NotFoundError } from '@/utils/AppError';
import {
  TASK_SEARCHABLE_FIELDS,
  TASK_SORTABLE_FIELDS,
  todayISODate,
  type TaskStatus,
} from '@/constants/task.constants';
import type { PaginatedResult, PaginationMeta } from '@/types/common.types';
import type { TaskStats } from '@/interfaces/task.interface';

type Scope = 'today' | 'history' | 'all';

interface ListOptions {
  scope?: Scope;
  page?: number;
  limit?: number;
  search?: string;
  status?: TaskStatus;
  priority?: string;
  date?: string; 
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

class TaskService extends BaseService<ITaskDocument> {
  constructor() {
    super(TaskModel, 'Task');
  }

  async createForUser(userId: string, payload: Record<string, unknown>): Promise<ITaskDocument> {
    return TaskModel.create({
      ...payload,
      user: new Types.ObjectId(userId),
    } as unknown as Partial<ITaskDocument>);
  }

  async listForUser(
    userId: string,
    opts: ListOptions,
  ): Promise<PaginatedResult<ITaskDocument>> {
    const today = todayISODate();
    const filter: FilterQuery<ITaskDocument> = { user: new Types.ObjectId(userId) };

    if (opts.date) {
      filter.date = opts.date;
    } else if (opts.scope === 'today') {
      filter.date = { $gte: today };
    } else if (opts.scope === 'history') {
      filter.date = { $lt: today };
    }

    if (opts.status) filter.status = opts.status;
    if (opts.priority) (filter as Record<string, unknown>).priority = opts.priority;

    if (opts.search?.trim()) {
      const regex = { $regex: opts.search.trim(), $options: 'i' };
      (filter as Record<string, unknown>).$or = TASK_SEARCHABLE_FIELDS.map((f) => ({ [f]: regex }));
    }

   
    const sortByRaw = String(opts.sortBy ?? 'date');
    const sortBy = (TASK_SORTABLE_FIELDS as readonly string[]).includes(sortByRaw) ? sortByRaw : 'date';
    const dir = opts.sortOrder === 'asc' ? 1 : -1;

    const page = Math.max(1, opts.page ?? 1);
    const limit = Math.min(Math.max(1, opts.limit ?? 20), 100);

    const [results, total] = await Promise.all([
      TaskModel.find(filter)
        .sort({ [sortBy]: dir, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      TaskModel.countDocuments(filter),
    ]);

    const totalPages = Math.max(1, Math.ceil(total / limit));
    const meta: PaginationMeta = {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };
    return { results, meta };
  }

  async findByIdForUser(userId: string, id: string): Promise<ITaskDocument> {
    const task = await TaskModel.findOne({ _id: id, user: userId });
    if (!task) throw new NotFoundError('Task not found');
    return task;
  }

  async updateForUser(
    userId: string,
    id: string,
    payload: Record<string, unknown>,
  ): Promise<ITaskDocument> {
   
    const task = await TaskModel.findOne({ _id: id, user: userId });
    if (!task) throw new NotFoundError('Task not found');
    task.set(payload as UpdateQuery<ITaskDocument>);
    await task.save();
    return task;
  }


  async setStatusForUser(userId: string, id: string, status: TaskStatus): Promise<ITaskDocument> {
    return this.updateForUser(userId, id, { status });
  }

  async softDeleteForUser(userId: string, id: string): Promise<void> {
    const task = await TaskModel.findOne({ _id: id, user: userId });
    if (!task) throw new NotFoundError('Task not found');
    await task.softDelete(userId);
  }

  async restoreForUser(userId: string, id: string): Promise<ITaskDocument> {
    const task = await TaskModel.findOneWithDeleted({ _id: id, user: userId });
    if (!task) throw new NotFoundError('Task not found');
    await task.restore();
    return task;
  }

  
  async getStatsForUser(userId: string, date?: string): Promise<TaskStats> {
    const match: FilterQuery<ITaskDocument> = {
      user: new Types.ObjectId(userId),
      isDeleted: { $ne: true },
      date: date ?? todayISODate(),
    };

    const [result] = await TaskModel.aggregate<Record<string, number>>([
      { $match: match },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
          pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
          high: { $sum: { $cond: [{ $eq: ['$priority', 'high'] }, 1, 0] } },
          medium: { $sum: { $cond: [{ $eq: ['$priority', 'medium'] }, 1, 0] } },
          low: { $sum: { $cond: [{ $eq: ['$priority', 'low'] }, 1, 0] } },
        },
      },
    ]);

    return {
      total: result?.total ?? 0,
      completed: result?.completed ?? 0,
      pending: result?.pending ?? 0,
      high: result?.high ?? 0,
      medium: result?.medium ?? 0,
      low: result?.low ?? 0,
    };
  }
}

export const taskService = new TaskService();