import Destination from '../models/Destination.js';
import Package from '../models/Package.js';
import Review from '../models/Review.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// GET /api/destinations  (filter + sort)
export const listDestinations = asyncHandler(async (req, res) => {
  const { type, country, q, sort = 'order', page = 1, limit = 12 } = req.query;
  const filter = {};
  if (type) filter.type = type;
  if (country) filter.country = new RegExp(country, 'i');
  if (q) filter.$or = [{ name: new RegExp(q, 'i') }, { country: new RegExp(q, 'i') }];
  const sortMap = { order: { displayOrder: 1 }, price: { startingPrice: 1 }, rating: { rating: -1 }, newest: { createdAt: -1 } };
  const skip = (Number(page) - 1) * Number(limit);
  const [items, total] = await Promise.all([
    Destination.find(filter).sort(sortMap[sort] || sortMap.order).skip(skip).limit(Number(limit)),
    Destination.countDocuments(filter)
  ]);
  res.json({ success: true, total, page: Number(page), pages: Math.ceil(total / Number(limit)), items });
});

// GET /api/destinations/popular
export const popularDestinations = asyncHandler(async (req, res) => {
  const items = await Destination.find({ popular: true }).sort({ displayOrder: 1 }).limit(Number(req.query.limit) || 12);
  res.json({ success: true, items });
});

// GET /api/destinations/:slug  (full page data)
export const getDestination = asyncHandler(async (req, res) => {
  const dest = await Destination.findOne({ slug: req.params.slug });
  if (!dest) return res.status(404).json({ success: false, message: 'Destination not found' });
  const [packages, related, reviews] = await Promise.all([
    Package.find({ $or: [{ city: dest.name }, { country: dest.country }] }).limit(8),
    Destination.find({ _id: { $ne: dest._id }, country: dest.country }).limit(4),
    Review.find({ approved: true }).sort('-createdAt').limit(6)
  ]);
  res.json({ success: true, destination: dest, packages, related, reviews });
});

// ---- Admin CRUD ----
export const createDestination = asyncHandler(async (req, res) => {
  const dest = await Destination.create(req.body);
  res.status(201).json({ success: true, destination: dest });
});
export const updateDestination = asyncHandler(async (req, res) => {
  const dest = await Destination.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!dest) return res.status(404).json({ success: false, message: 'Not found' });
  res.json({ success: true, destination: dest });
});
export const deleteDestination = asyncHandler(async (req, res) => {
  await Destination.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Destination deleted' });
});
