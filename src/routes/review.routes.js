import { Router } from 'express';
import { listReviews, addReview } from '../controllers/misc.controller.js';
import { protect } from '../middleware/auth.js';
const r = Router();
r.get('/:packageId', listReviews);
r.post('/:packageId', protect, addReview);
export default r;
