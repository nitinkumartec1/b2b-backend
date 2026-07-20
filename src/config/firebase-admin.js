import admin from 'firebase-admin';
import logger from '../utils/logger.js';

/**
 * Lazily initializes Firebase Admin SDK.
 * Only runs when actually called (not at module load time).
 * Returns null if FIREBASE_SERVICE_ACCOUNT is not configured.
 */
export function getFirebaseAdmin() {
  if (admin.apps.length > 0) {
    return admin;
  }

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) {
    logger.warn('FIREBASE_SERVICE_ACCOUNT env var is not set. Phone verification will not work.');
    return null;
  }

  try {
    const serviceAccount = JSON.parse(raw);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    return admin;
  } catch (err) {
    logger.error('Failed to initialize Firebase Admin SDK:', err.message);
    return null;
  }
}
