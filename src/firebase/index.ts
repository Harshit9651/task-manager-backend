
import admin from 'firebase-admin';
import { config } from '@/config';
import { logger } from '@/utils/logger';

let firebaseApp: admin.app.App | null = null;


 
export const initializeFirebase = (): admin.app.App | null => {
  if (firebaseApp) return firebaseApp;

  const { projectId, clientEmail, privateKey } = config.firebase;

  if (!projectId || !clientEmail || !privateKey) {
    if (config.isProduction) {
      throw new Error('Firebase Admin credentials are required in production.');
    }
    logger.warn('Firebase Admin credentials missing — Firebase features disabled (development only).');
    return null;
  }

  firebaseApp = admin.initializeApp({
    credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
  });

  logger.info('Firebase Admin SDK initialized.');
  return firebaseApp;
};


export const getFirebaseAuth = (): admin.auth.Auth => {
  if (!firebaseApp) {
    throw new Error('Firebase Admin has not been initialized. Check your Firebase credentials.');
  }
  return firebaseApp.auth();
};

export { admin };