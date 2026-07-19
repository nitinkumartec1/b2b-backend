import { Router } from 'express';
import { globalSearch } from '../controllers/search.controller.js';
const r = Router();
r.get('/', globalSearch);
export default r;
