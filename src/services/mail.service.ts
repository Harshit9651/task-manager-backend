import { Resend } from 'resend';
import { logger } from '@/utils/logger';
import { AppError } from '@/utils/AppError';
import { HttpStatus } from '@/constants/httpStatus';
import type { RenderedEmail } from '@/interfaces/email.interface';

let resend: Resend | null = null;
let initialized = false;
const from = process.env.RESEND_FROM_EMAIL;

if (!from) {
  throw new AppError(
    "RESEND_FROM_EMAIL is not configured",
    HttpStatus.SERVICE_UNAVAILABLE,
  );
}


const getClient = (): Resend | null => {
  if (initialized) return resend;
  initialized = true;

  const key = process.env.RESEND_API_KEY;
  if (!key) {
    logger.warn('RESEND_API_KEY missing — emails will be skipped.');
    resend = null;
    return null;
  }
  resend = new Resend(key);
  return resend;
};


export const verifyMailConnection = async (): Promise<boolean> => {
  const client = getClient();
  if (!client) return false;
  logger.info('Resend client initialized.');
  return true;
};

interface SendArgs extends RenderedEmail {
  to: string;
}


export const sendMail = async ({ to, subject, html, text }: SendArgs): Promise<string> => {
  const client = getClient();
  if (!client) throw new AppError('Email service is not configured', HttpStatus.SERVICE_UNAVAILABLE);

  const { data, error } = await client.emails.send({
    from,
    to: [to],
    subject,
    html,
    text,
  });


  if (error) {
    throw new AppError(
      `Resend error: ${error.message ?? 'unknown'}`,
      HttpStatus.BAD_GATEWAY,
      undefined,
      true,
    );
  }
  if (!data?.id) {
    throw new AppError('Resend returned no message id', HttpStatus.BAD_GATEWAY);
  }
  return data.id; 
};