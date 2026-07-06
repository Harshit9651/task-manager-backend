import { config } from '@/config';
import { logger } from '@/utils/logger';
import { UserModel, type IUserDocument } from '@/models/user.model';
import { leadService } from '@/services/lead.service';
import { taskService } from '@/services/task.service';
import { sendMail } from '@/services/mail.service';
import { emailLogService } from '@/services/emailLog.service';
import { weeklyReportTemplate } from '@/templates';
import { EmailStatus, EmailType } from '@/constants/email.constants';
import { getTodayInTimezone, formatShortDate } from '@/utils/datetime.util';

type SendResult = { status: 'sent' } | { status: 'skipped'; reason: string };
const WEEK_MS = 7 * 86_400_000;

class ReportService {
  async sendForUser(user: IUserDocument, opts: { force?: boolean } = {}): Promise<SendResult> {
    const tz = user.notificationPreferences?.timezone || config.cron.timezone;

    if (!opts.force && !user.notificationPreferences?.weeklyReport) return { status: 'skipped', reason: 'disabled' };

    const todayKey = getTodayInTimezone(tz);
    const sentKey = `week-${todayKey}`;
    if (!opts.force && (await emailLogService.wasSent(user.id, EmailType.WEEKLY_REPORT, sentKey))) return { status: 'skipped', reason: 'already_sent' };

    const since = new Date(Date.now() - WEEK_MS);
    const [leadStats, newLeads, tasks, upcoming] = await Promise.all([
      leadService.getStatsForUser(user.id),
      leadService.countCreatedSince(user.id, since),
      taskService.getWeeklyTaskSummary(user.id, since),
      leadService.getUpcomingFollowUps(user.id, tz, 7),
    ]);

    const rendered = weeklyReportTemplate({
      name: user.name,
      rangeLabel: `${formatShortDate(since, tz)} – ${formatShortDate(new Date(), tz)}`,
      leadStats: { total: leadStats.total, won: leadStats.won, hot: leadStats.hot, contacted: leadStats.contacted },
      newLeads, tasks, upcoming, appName: config.app.name, appUrl: config.app.url,
    });

    try {
      const messageId = await sendMail({ to: user.email, ...rendered });
      await emailLogService.record({ user: user.id, to: user.email, type: EmailType.WEEKLY_REPORT, subject: rendered.subject, status: EmailStatus.SENT, messageId, sentKey });
      return { status: 'sent' };
    } catch (err) {
      await emailLogService.record({ user: user.id, to: user.email, type: EmailType.WEEKLY_REPORT, subject: rendered.subject, status: EmailStatus.FAILED, error: (err as Error).message, sentKey }).catch(() => undefined);
      throw err;
    }
  }

  async runForAllUsers(): Promise<void> {
    const users = await UserModel.find({ isActive: true,"notificationPreferences.dailyFollowUpReminder":true });
    let sent = 0, skipped = 0, failed = 0;
    for (const user of users) {
      try { const res = await this.sendForUser(user); res.status === 'sent' ? sent++ : skipped++; }
      catch (err) { failed++; logger.error(`Weekly report failed for ${user.email}:`, (err as Error).message); }
    }
    logger.info(`Weekly reports — sent: ${sent}, skipped: ${skipped}, failed: ${failed} (of ${users.length} users)`);
  }
}

export const reportService = new ReportService();