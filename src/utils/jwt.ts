
import jwt, { type SignOptions, type JwtPayload as JwtLibPayload } from 'jsonwebtoken';
import { config } from '@/config';
import type { JwtPayload } from '@/interfaces/auth.interface';

const sign = (payload: JwtPayload, secret: string, expiresIn: string): string => {
 
  const options: SignOptions = { expiresIn: expiresIn as SignOptions['expiresIn'] };
  return jwt.sign(payload, secret, options);
};

export const signAccessToken = (payload: JwtPayload): string =>
  sign(payload, config.jwt.secret, config.jwt.expiresIn);

export const signRefreshToken = (payload: JwtPayload): string =>
  sign(payload, config.jwt.refreshSecret, config.jwt.refreshExpiresIn);


const verify = (token: string, secret: string): JwtPayload => {
  const decoded = jwt.verify(token, secret) as JwtLibPayload & Partial<JwtPayload>;
  return {
    sub: String(decoded.sub),
    email: decoded.email ?? '',
    role: decoded.role as JwtPayload['role'],
  };
};

export const verifyAccessToken = (token: string): JwtPayload => verify(token, config.jwt.secret);

export const verifyRefreshToken = (token: string): JwtPayload =>
  verify(token, config.jwt.refreshSecret);