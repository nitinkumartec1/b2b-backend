import { Router } from 'express';
import { validateCoupon } from '../controllers/misc.controller.js';
const r = Router();
r.post('/validate', validateCoupon);
export default r;
