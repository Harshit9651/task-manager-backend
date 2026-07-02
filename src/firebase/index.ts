// src/firebase/index.ts

import admin from "firebase-admin";

import { logger } from "@/utils/logger";
import { config } from "@/config/config";

let firebaseApp: admin.app.App | null = null;

export const initializeFirebase = (): admin.app.App | null => {
  if (firebaseApp) {
    return firebaseApp;
  }

  const firebaseConfig = {
    type: config.firebase.type,
    projectId: config.firebase.projectId,
    privateKeyId: config.firebase.privateKeyId,
    privateKey: config.firebase.privateKey?.replace(/\\n/g, "\n"),
    clientEmail: config.firebase.clientEmail,
    clientId: config.firebase.clientId,
    authUri: config.firebase.authUri,
    tokenUri: config.firebase.tokenUri,
    authProviderX509CertUrl: config.firebase.authProviderX509CertUrl,
    clientX509CertUrl: config.firebase.clientX509CertUrl,
    universeDomain: config.firebase.universeDomain,
  };

  const requiredFields = [
    firebaseConfig.projectId,
    firebaseConfig.privateKey,
    firebaseConfig.clientEmail,
  ];

  const missingCredentials = requiredFields.some(
    (value) => !value || value.trim() === ""
  );

  if (missingCredentials) {
    if (config.isProduction) {
      throw new Error("Firebase Admin credentials are missing.");
    }

    logger.warn(
      "Firebase credentials not found. Firebase authentication is disabled."
    );

    return null;
  }

  firebaseApp = admin.initializeApp({
    credential: admin.credential.cert({
      projectId: firebaseConfig.projectId,
      privateKey: firebaseConfig.privateKey,
      clientEmail: firebaseConfig.clientEmail,
    }),
  });

  logger.info("Firebase Admin initialized successfully.");

  return firebaseApp;
};

export const getFirebaseAuth = (): admin.auth.Auth => {
  if (!firebaseApp) {
    throw new Error(
      "Firebase has not been initialized. Call initializeFirebase() first."
    );
  }

  return admin.auth(firebaseApp);
};

export default admin;