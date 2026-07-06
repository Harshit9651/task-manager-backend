import type { Types } from 'mongoose';
import type { SoftDeleteFields } from '@/database/plugins/softDelete.plugin';
import type { TaskPriority, TaskStatus } from '@/constants/task.constants';


export interface ITask extends SoftDeleteFields {
  user: Types.ObjectId;
  title: string;
  description?: string;
  dueTime?: string; 
  priority: TaskPriority;
  tag: string;
  status: TaskStatus;
  date: string; 
  completedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}


export interface TaskStats {
  total: number;
  completed: number;
  pending: number;
  high: number;
  medium: number;
  low: number;
}