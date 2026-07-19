import User from '../models/User.js';
import Package from '../models/Package.js';
import Booking from '../models/Booking.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const dashboardStats = asyncHandler(async (req, res) => {
  const [users, agents, packages, bookings, revenueAgg] = await Promise.all([
    User.countDocuments({ role: 'user' }),
    User.countDocuments({ role: 'agent' }),
    Package.countDocuments(),
    Booking.countDocuments(),
    Booking.aggregate([{ $match: { paymentStatus: { $in: ['paid', 'partial'] } } }, { $group: { _id: null, total: { $sum: '$total' } } }])
  ]);
  const recentBookings = await Booking.find().sort('-createdAt').limit(8).populate('package', 'title').populate('user', 'name email');
  res.json({
    success: true,
    stats: { users, agents, packages, bookings, revenue: revenueAgg[0]?.total || 0 },
    recentBookings
  });
});

export const listUsers = asyncHandler(async (req, res) => {
  const { role } = req.query;
  const filter = role ? { role } : {};
  const users = await User.find(filter).sort('-createdAt');
  res.json({ success: true, users });
});

export const approveAgent = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { approved: true }, { new: true });
  res.json({ success: true, user });
});

export const setAgentTerms = asyncHandler(async (req, res) => {
  const { creditLimit, markupPercent } = req.body;
  const user = await User.findByIdAndUpdate(req.params.id, { creditLimit, markupPercent }, { new: true });
  res.json({ success: true, user });
});

export const allBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find().sort('-createdAt').populate('package', 'title').populate('user', 'name email role');
  res.json({ success: true, bookings });
});
