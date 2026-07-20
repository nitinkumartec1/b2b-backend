import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import logger from '../utils/logger.js';

/**
 * Lazily initializes Firebase Admin SDK and returns the Auth instance.
 * Only runs when actually called (not at module load time).
 * Returns null if FIREBASE_SERVICE_ACCOUNT is not configured.
 */
export function getFirebaseAuthAdmin() {
  if (getApps().length > 0) {
    return getAuth();
  }

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) {
    logger.warn('FIREBASE_SERVICE_ACCOUNT env var is not set. Auth verification will not work.');
    return null;
  }

  try {
    const serviceAccount = JSON.parse(raw);
    const app = initializeApp({
      credential: cert(serviceAccount),
    });
    return getAuth(app);
  } catch (err) {
    logger.error('Failed to initialize Firebase Admin SDK:', err.message);
    return null;
  }
}
