import { getFirebaseAuth } from '@/firebase';
import { AppError, UnauthorizedError } from '@/utils/AppError';
import { HttpStatus } from '@/constants/httpStatus';
import { logger } from '@/utils/logger';
import type { DecodedFirebaseUser } from '@/interfaces/auth.interface';

export const verifyFirebaseIdToken = async (idToken: string): Promise<DecodedFirebaseUser> => {
  let auth: ReturnType<typeof getFirebaseAuth>;
  try {
    auth = getFirebaseAuth();
  } catch {

    throw new AppError('Authentication service is not configured', HttpStatus.SERVICE_UNAVAILABLE);
  }

  let decoded;
  try {
 
    decoded = await auth.verifyIdToken(idToken, true);
  } catch (error) {
    logger.warn('Firebase ID token verification failed:', (error as Error).message);
    throw new UnauthorizedError('Invalid or expired Google sign-in token');
  }

  if (!decoded.email) {
    throw new UnauthorizedError('Google account has no email associated');
  }

  return {
    uid: decoded.uid,
    email: decoded.email,
    name: decoded.name as string | undefined,
    picture: decoded.picture as string | undefined,
    emailVerified: decoded.email_verified ?? false,
  };
};