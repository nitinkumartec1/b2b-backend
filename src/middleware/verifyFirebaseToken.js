import admin from '../config/firebase-admin.js';
import logger from '../utils/logger.js';

/**
 * Middleware to verify Firebase ID token from the Authorization header.
 * Attaches decoded user info (including phone_number) to req.firebaseUser.
 */
export const verifyFirebaseToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Phone verification required. Please verify your mobile number before submitting an enquiry.'
    });
  }

  const idToken = authHeader.split('Bearer ')[1];

  try {
    const decoded = await admin.auth().verifyIdToken(idToken);

    if (!decoded.phone_number) {
      return res.status(403).json({
        success: false,
        message: 'Phone number not verified. Please verify your mobile number.'
      });
    }

    req.firebaseUser = {
      uid: decoded.uid,
      phone: decoded.phone_number,
    };

    next();
  } catch (error) {
    logger.error('Firebase token verification failed:', error.message);
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired verification. Please verify your phone number again.'
    });
  }
};
