
import path from 'node:path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const optionalEnv = (key: string, fallback: string): string => {
  const value = process.env[key];
  return value === undefined || value.trim() === '' ? fallback : value;
};

const toNumber = (value: string, key: string): number => {
  const parsed = Number(value);
  if (Number.isNaN(parsed)) {
    throw new Error(`Environment variable "${key}" must be a number, received "${value}".`);
  }
  return parsed;
};

const nodeEnv = optionalEnv('NODE_ENV', 'development');
const isProduction = nodeEnv === 'production';

export const config = {
  env: nodeEnv,
  isProduction,
  isDevelopment: !isProduction,

  port: toNumber(optionalEnv('PORT', '5000'), 'PORT'),
  apiPrefix: optionalEnv('API_PREFIX', '/api'),
  app: {
    name: optionalEnv('APP_NAME', 'task-manager-thdevwix'),
    url: optionalEnv('APP_URL', 'http://localhost:5000'),
  },
    mail: {
    resendApiKey: optionalEnv('RESEND_API_KEY', ''),
    from: optionalEnv('EMAIL_FROM', ' <mail.thdevwix.com>'),
  },

  cron: {
    enabled: optionalEnv('CRON_ENABLED', 'true') === 'true',
    timezone: optionalEnv('CRON_TIMEZONE', 'UTC'),
    dailyReminder: optionalEnv('DAILY_REMINDER_CRON', '0 8 * * *'),
    weeklyReport: optionalEnv('WEEKLY_REPORT_CRON', '0 8 * * 1'),
  },

  mongo: {
    uri: optionalEnv('MONGODB_URI', 'mongodb://127.0.0.1:27017/saas_crm'),
  },

  jwt: {
    secret: optionalEnv('JWT_SECRET', 'dev_only_insecure_jwt_secret'),
    expiresIn: optionalEnv('JWT_EXPIRES_IN', '1d'),
    refreshSecret: optionalEnv('JWT_REFRESH_SECRET', 'dev_only_insecure_refresh_secret'),
    refreshExpiresIn: optionalEnv('JWT_REFRESH_EXPIRES_IN', '7d'),
  },

  cookie: {
    secret: optionalEnv('COOKIE_SECRET', 'dev_only_insecure_cookie_secret'),
  },

  cors: {
    origins: optionalEnv('CORS_ORIGIN', 'http://localhost:3000,http://localhost:5173,https://task-manager-pi-eight-75.vercel.app')
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
  },

  rateLimit: {
    windowMs: toNumber(optionalEnv('RATE_LIMIT_WINDOW_MS', String(15 * 60 * 1000)), 'RATE_LIMIT_WINDOW_MS'),
    max: toNumber(optionalEnv('RATE_LIMIT_MAX', '100'), 'RATE_LIMIT_MAX'),
  },

  firebase: {
    projectId: optionalEnv('FIREBASE_PROJECT_ID', ''),
    privateKey: optionalEnv('FIREBASE_PRIVATE_KEY', '').replace(/\\n/g, '\n'),
  },


};


if (isProduction) {
  const requiredInProd = [
    'MONGODB_URI',
    'JWT_SECRET',
    'COOKIE_SECRET',
    'FIREBASE_PROJECT_ID',
    'FIREBASE_CLIENT_EMAIL',
    'FIREBASE_PRIVATE_KEY',
  ];
  const missing = requiredInProd.filter(
    (key) => !process.env[key] || process.env[key]?.trim() === '',
  );
  if (missing.length > 0) {
    throw new Error(`Missing required production environment variables: ${missing.join(', ')}`);
  }
}