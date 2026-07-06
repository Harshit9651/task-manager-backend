import { EmailLogModel } from '@/models/emailLog.model';
import type { EmailStatus, EmailType } from '@/constants/email.constants';

interface RecordArgs {
  user?: string | null;
  to: string;
  type: EmailType;
  subject: string;
  status: EmailStatus;
  messageId?: string | null;
  error?: string | null;
  sentKey?: string | null;
  meta?: Record<string, unknown>;
}

class EmailLogService {
  record(args: RecordArgs) {
    return EmailLogModel.create(args);
  }
  async wasSent(userId: string, type: EmailType, sentKey: string): Promise<boolean> {
    const existing = await EmailLogModel.exists({ user: userId, type, sentKey, status: 'sent' });
    return existing !== null;
  }
}

export const emailLogService = new EmailLogService();