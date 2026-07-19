import { Router } from 'express';
import { listBlogs, getBlog } from '../controllers/misc.controller.js';
const r = Router();
r.get('/', listBlogs);
r.get('/:slug', getBlog);
export default r;
