import { Schema, model, type Document } from 'mongoose';

import { EMAIL_STATUSES, EMAIL_TYPES, EmailStatus, EmailType } from '@/constants/email.constants';

export interface IEmailLog {
  user?: Schema.Types.ObjectId | null;
  to: string;
  type: EmailType;
  subject: string;
  status: EmailStatus;
  messageId?: string | null;
  error?: string | null;
  sentKey?: string | null;
  meta?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface IEmailLogDocument extends IEmailLog, Document {}

const emailLogSchema = new Schema<IEmailLogDocument>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    to: { type: String, required: true },
    type: { type: String, enum: [...EMAIL_TYPES], required: true, index: true },
    subject: { type: String, required: true },
    status: { type: String, enum: [...EMAIL_STATUSES], required: true },
    messageId: { type: String, default: null },
    error: { type: String, default: null },
    sentKey: { type: String, default: null },
    meta: { type: Schema.Types.Mixed, default: {} },
  },

);

emailLogSchema.index({ user: 1, type: 1, sentKey: 1 });

export const EmailLogModel = model<IEmailLogDocument>('EmailLog', emailLogSchema);