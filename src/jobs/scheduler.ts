import cron, { type ScheduledTask } from 'node-cron';
import { config } from '@/config';
import { logger } from '@/utils/logger';
import { runDailyReminderJob } from '@/jobs/dailyReminder.job';
import { runWeeklyReportJob } from '@/jobs/weeklyReport.job';

const tasks: ScheduledTask[] = [];
const running = new Set<string>();

const guard = (name: string, fn: () => Promise<void>) => async (): Promise<void> => {
  if (running.has(name)) { logger.warn(`Cron "${name}" still running — skipping this tick.`); return; }
  running.add(name);
  const startedAt = Date.now();
  try {
    logger.info(`Cron "${name}" started.`);
    await fn();
    logger.info(`Cron "${name}" completed in ${Date.now() - startedAt}ms.`);
  } catch (err) {
    logger.error(`Cron "${name}" crashed:`, err);
  } finally {
    running.delete(name);
  }
};

export const startScheduler = (): void => {
  if (!config.cron.enabled) { logger.warn('Scheduler disabled (CRON_ENABLED=false).'); return; }
  const tz = config.cron.timezone;
  const defs: Array<[string, string, () => Promise<void>]> = [
    ['daily-reminder', config.cron.dailyReminder, runDailyReminderJob],
    ['weekly-report', config.cron.weeklyReport, runWeeklyReportJob],
  ];
  for (const [name, expr, fn] of defs) {
    if (!cron.validate(expr)) { logger.error(`Invalid cron for "${name}": "${expr}" — skipped.`); continue; }
    tasks.push(cron.schedule(expr, guard(name, fn), { timezone: tz }));
    logger.info(`Scheduled "${name}" [${expr}] timezone=${tz}.`);
  }
};

export const stopScheduler = (): void => {
  for (const task of tasks) task.stop();
  tasks.length = 0;
  logger.info('Scheduler stopped.');
};