import express from 'express';
import { createEnquiry, getEnquiries, updateEnquiryStatus } from '../controllers/enquiry.controller.js';
import { protect, authorize } from '../middleware/auth.js';
import { verifyFirebaseToken } from '../middleware/verifyFirebaseToken.js';

const router = express.Router();

router.post('/', verifyFirebaseToken, createEnquiry);
router.get('/', protect, authorize('admin'), getEnquiries);
router.patch('/:id/status', protect, authorize('admin'), updateEnquiryStatus);

export default router;
