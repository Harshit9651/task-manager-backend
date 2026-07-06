import { config } from '@/config';
import { logger } from '@/utils/logger';
import { UserModel, type IUserDocument } from '@/models/user.model';
import { leadService } from '@/services/lead.service';
import { taskService } from '@/services/task.service';
import { sendMail } from '@/services/mail.service';
import { emailLogService } from '@/services/emailLog.service';
import { followUpReminderTemplate } from '@/templates';
import { EmailStatus, EmailType } from '@/constants/email.constants';
import { getTodayInTimezone, formatLongDate } from '@/utils/datetime.util';
import type { TaskEmailItem } from '@/interfaces/email.interface';

type SendResult = { status: 'sent' } | { status: 'skipped'; reason: string };

class ReminderService {
  async sendForUser(user: IUserDocument, opts: { force?: boolean } = {}): Promise<SendResult> {
    const tz = user.notificationPreferences?.timezone || config.cron.timezone;

    if (!opts.force && !user.notificationPreferences?.dailyFollowUpReminder) return { status: 'skipped', reason: 'disabled' };

    const todayKey = getTodayInTimezone(tz);
    if (!opts.force && (await emailLogService.wasSent(user.id, EmailType.DAILY_REMINDER, todayKey))) return { status: 'skipped', reason: 'already_sent' };

    const { dueToday, overdue } = await leadService.getFollowUpBuckets(user.id, tz);
    const taskDocs = await taskService.getTasksForDate(user.id, todayKey);
    const tasks: TaskEmailItem[] = taskDocs.map((t) => ({ title: t.title, priority: t.priority, tag: t.tag, dueTime: t.dueTime, completed: t.status === 'completed' }));

    if (!opts.force && dueToday.length === 0 && overdue.length === 0 && tasks.length === 0) return { status: 'skipped', reason: 'empty' };

    const rendered = followUpReminderTemplate({
      name: user.name, dateLabel: formatLongDate(new Date(), tz),
      dueToday, overdue, tasks, appName: config.app.name, appUrl: config.app.url,
    });

    try {
      const messageId = await sendMail({ to: user.email, ...rendered });
      await emailLogService.record({ user: user.id, to: user.email, type: EmailType.DAILY_REMINDER, subject: rendered.subject, status: EmailStatus.SENT, messageId, sentKey: todayKey, meta: { dueToday: dueToday.length, overdue: overdue.length, tasks: tasks.length } });
      return { status: 'sent' };
    } catch (err) {
      await emailLogService.record({ user: user.id, to: user.email, type: EmailType.DAILY_REMINDER, subject: rendered.subject, status: EmailStatus.FAILED, error: (err as Error).message, sentKey: todayKey }).catch(() => undefined);
      throw err;
    }
  }

  async runForAllUsers(): Promise<void> {
    const users = await UserModel.find({ isActive: true });
    let sent = 0, skipped = 0, failed = 0;
    for (const user of users) {
      try { const res = await this.sendForUser(user); res.status === 'sent' ? sent++ : skipped++; }
      catch (err) { failed++; logger.error(`Daily reminder failed for ${user.email}:`, (err as Error).message); }
    }
    logger.info(`Daily reminders — sent: ${sent}, skipped: ${skipped}, failed: ${failed} (of ${users.length} users)`);
  }
}

export const reminderService = new ReminderService();