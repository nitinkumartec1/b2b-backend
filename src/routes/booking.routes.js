import { Router } from 'express';
import { createBooking, myBookings, getBooking, updateBookingStatus } from '../controllers/booking.controller.js';
import { protect, authorize } from '../middleware/auth.js';
const r = Router();
r.post('/', protect, createBooking);
r.get('/my', protect, myBookings);
r.get('/:id', protect, getBooking);
r.put('/:id/status', protect, authorize('admin', 'agent'), updateBookingStatus);
export default r;
