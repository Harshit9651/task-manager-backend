import type { Types } from 'mongoose';
import type { SoftDeleteFields } from '@/database/plugins/softDelete.plugin';
export type BoardSnapshot = Record<string, unknown>;
export interface IBoard extends SoftDeleteFields {
  user: Types.ObjectId;
  title: string;
  boardDate: string; 
  snapshot?: BoardSnapshot | null;
  thumbnail?: string | null; 
  createdAt: Date;
  updatedAt: Date;
}