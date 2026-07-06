export enum EmailType {
  WELCOME = 'welcome',
  DAILY_REMINDER = 'daily_reminder',
  WEEKLY_REPORT = 'weekly_report',
  CUSTOM = 'custom',
}

export enum EmailStatus {
  SENT = 'sent',
  FAILED = 'failed',
}

export const EMAIL_TYPES = Object.values(EmailType);
export const EMAIL_STATUSES = Object.values(EmailStatus);