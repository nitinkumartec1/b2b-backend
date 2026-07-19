import { Router } from 'express';
import { getWallet, rechargeWallet } from '../controllers/misc.controller.js';
import { protect } from '../middleware/auth.js';
const r = Router();
r.get('/', protect, getWallet);
r.post('/recharge', protect, rechargeWallet);
export default r;
