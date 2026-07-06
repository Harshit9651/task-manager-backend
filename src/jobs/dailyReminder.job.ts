import { reminderService } from '@/services/reminder.service';
export const runDailyReminderJob = (): Promise<void> => reminderService.runForAllUsers();