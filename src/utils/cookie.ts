import type { CookieOptions } from 'express';
import { config } from '@/config';

export const REFRESH_COOKIE_NAME = 'refreshToken';

const REFRESH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; 
const COOKIE_PATH = `${config.apiPrefix}/auth`;

const baseCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: config.isProduction, 
  sameSite: config.isProduction ? 'none' : 'lax',
  path: COOKIE_PATH,
};

export const refreshCookieOptions: CookieOptions = {
  ...baseCookieOptions,
  maxAge: REFRESH_COOKIE_MAX_AGE,
};


export const clearRefreshCookieOptions: CookieOptions = { ...baseCookieOptions };