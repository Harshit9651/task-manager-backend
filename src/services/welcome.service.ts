import { config } from '@/config';
import { logger } from '@/utils/logger';
import { sendMail } from '@/services/mail.service';
import { emailLogService } from '@/services/emailLog.service';
import { welcomeTemplate } from '@/templates';
import { EmailStatus, EmailType } from '@/constants/email.constants';

interface WelcomeUser { id: string; email: string; name?: string; }

export const sendWelcomeEmail = async (
  user: WelcomeUser,
  { throwOnError = false }: { throwOnError?: boolean } = {},
): Promise<void> => {
  const rendered = welcomeTemplate({ name: user.name, email: user.email, appName: config.app.name, appUrl: config.app.url });
  try {
    const messageId = await sendMail({ to: user.email, ...rendered });
    await emailLogService.record({ user: user.id, to: user.email, type: EmailType.WELCOME, subject: rendered.subject, status: EmailStatus.SENT, messageId, sentKey: 'welcome' });
  } catch (err) {
    logger.error('Welcome email failed:', (err as Error).message);
    await emailLogService.record({ user: user.id, to: user.email, type: EmailType.WELCOME, subject: rendered.subject, status: EmailStatus.FAILED, error: (err as Error).message, sentKey: 'welcome' }).catch(() => undefined);
    if (throwOnError) throw err;
  }
};