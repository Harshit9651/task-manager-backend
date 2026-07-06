import type { Request, Response } from 'express';
import { asyncHandler } from '@/utils/asyncHandler';
import { taskService } from '@/services/task.service';
import { sendCreated, sendSuccess } from '@/utils/ApiResponse';
import { pick } from '@/utils/pick';
import { MESSAGES } from '@/constants/messages';
import {
  TASK_CREATABLE_FIELDS,
  TASK_UPDATABLE_FIELDS,
  type TaskStatus,
} from '@/constants/task.constants';

const stripEmptyStrings = (obj: Record<string, unknown>): Record<string, unknown> =>
  Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== ''));

const shapeList = (results: unknown[], meta: { total: number; page: number; limit: number; totalPages: number }) => ({
  tasks: results,
  total: meta.total,
  page: meta.page,
  limit: meta.limit,
  totalPages: meta.totalPages,
});

class TaskController {

  create = asyncHandler(async (req: Request, res: Response) => {
    const payload = stripEmptyStrings(pick(req.body, TASK_CREATABLE_FIELDS));
    const task = await taskService.createForUser(req.user!.id, payload);
    sendCreated(res, { task }, 'Task created successfully');
  });


  list = asyncHandler(async (req: Request, res: Response) => {
    const q = req.query as Record<string, string | undefined>;
    const { results, meta } = await taskService.listForUser(req.user!.id, {
      scope: 'today',
      page: Number(q.page) || undefined,
      limit: Number(q.limit) || undefined,
      search: q.search,
      status: q.status as TaskStatus | undefined,
      priority: q.priority,
      date: q.date,
      sortBy: q.sortBy,
      sortOrder: q.sortOrder as 'asc' | 'desc' | undefined,
    });
    sendSuccess(res, { message: MESSAGES.FETCHED, data: shapeList(results, meta) });
  });


  history = asyncHandler(async (req: Request, res: Response) => {
    const q = req.query as Record<string, string | undefined>;
    const { results, meta } = await taskService.listForUser(req.user!.id, {
      scope: 'history',
      page: Number(q.page) || undefined,
      limit: Number(q.limit) || undefined,
      search: q.search,
      status: q.status as TaskStatus | undefined,
      priority: q.priority,
      date: q.date,
      sortBy: q.sortBy,
      sortOrder: q.sortOrder as 'asc' | 'desc' | undefined,
    });
    sendSuccess(res, { message: MESSAGES.FETCHED, data: shapeList(results, meta) });
  });

  stats = asyncHandler(async (req: Request, res: Response) => {
    const date = (req.query.date as string | undefined) || undefined;
    const stats = await taskService.getStatsForUser(req.user!.id, date);
    sendSuccess(res, { message: MESSAGES.FETCHED, data: { stats } });
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const task = await taskService.findByIdForUser(req.user!.id, String(req.params.id));
    sendSuccess(res, { message: MESSAGES.FETCHED, data: { task } });
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const payload = stripEmptyStrings(pick(req.body, TASK_UPDATABLE_FIELDS));
    const task = await taskService.updateForUser(req.user!.id, String(req.params.id), payload);
    sendSuccess(res, { message: 'Task updated successfully', data: { task } });
  });

  setStatus = asyncHandler(async (req: Request, res: Response) => {
    const { status } = req.body as { status: TaskStatus };
    const task = await taskService.setStatusForUser(req.user!.id, String(req.params.id), status);
    sendSuccess(res, { message: 'Task status updated', data: { task } });
  });

  remove = asyncHandler(async (req: Request, res: Response) => {
    console.log("removed")
   const result= await taskService.softDeleteForUser(req.user!.id, String(req.params.id));
   console.log(result)
    sendSuccess(res, { message: 'Task deleted successfully', data: { id: req.params.id } });
  });

  restore = asyncHandler(async (req: Request, res: Response) => {
    const task = await taskService.restoreForUser(req.user!.id, String(req.params.id));
    sendSuccess(res, { message: MESSAGES.RESTORED, data: { task } });
  });
}

export const taskController = new TaskController();