import { getFirebaseAdmin } from '../config/firebase-admin.js';
import logger from '../utils/logger.js';

/**
 * Middleware to verify Firebase ID token from the Authorization header.
 * Attaches decoded user info (including email) to req.firebaseUser.
 */
export const verifyFirebaseToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Sign in required. Please sign in before submitting an enquiry.'
    });
  }

  const firebaseAdmin = getFirebaseAdmin();
  if (!firebaseAdmin) {
    return res.status(503).json({
      success: false,
      message: 'Authentication service is not configured. Please contact support.'
    });
  }

  const idToken = authHeader.split('Bearer ')[1];

  try {
    const decoded = await firebaseAdmin.auth().verifyIdToken(idToken);

    if (!decoded.email) {
      return res.status(403).json({
        success: false,
        message: 'Email address not verified. Please verify your email.'
      });
    }

    req.firebaseUser = {
      uid: decoded.uid,
      email: decoded.email,
    };

    next();
  } catch (error) {
    logger.error('Firebase token verification failed:', error.message);
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired login. Please sign in again.'
    });
  }
};
