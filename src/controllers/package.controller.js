import Package from '../models/Package.js';
import Category from '../models/Category.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const buildFilter = (query) => {
  const {
    q, destination, country, state, city, type, theme, category, month,
    minPrice, maxPrice, hotelRating, duration, fixedDeparture,
    flightIncluded, visaIncluded, mealPlan, featured, popular, bestSelling
  } = query;
  const filter = {};
  if (q) filter.$text = { $search: q };
  if (destination) filter.destination = destination;
  if (country) filter.country = new RegExp(country, 'i');
  if (state) filter.state = new RegExp(state, 'i');
  if (city) filter.city = new RegExp(city, 'i');
  if (type) filter.type = type;
  if (theme) filter.theme = { $in: theme.split(',') };
  if (category) filter.categorySlug = category;
  if (hotelRating) filter.hotelRating = { $gte: Number(hotelRating) };
  if (duration) filter.durationDays = { $lte: Number(duration) };
  if (fixedDeparture) filter.fixedDeparture = fixedDeparture === 'true';
  if (flightIncluded) filter.flightIncluded = flightIncluded === 'true';
  if (visaIncluded) filter.visaIncluded = visaIncluded === 'true';
  if (mealPlan) filter.mealPlan = new RegExp(mealPlan, 'i');
  if (featured) filter.featured = featured === 'true';
  if (popular) filter.popular = popular === 'true';
  if (bestSelling) filter.bestSelling = bestSelling === 'true';
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }
  if (month) filter.availableDates = { $exists: true };
  return filter;
};

const sortMap = {
  price: { price: 1 }, price_desc: { price: -1 }, rating: { rating: -1 },
  newest: { createdAt: -1 }, duration: { durationDays: 1 },
  popularity: { popular: -1, rating: -1 }
};

// GET /api/packages
export const listPackages = asyncHandler(async (req, res) => {
  const { sort = 'popularity', page = 1, limit = 12 } = req.query;
  const filter = buildFilter(req.query);
  const skip = (Number(page) - 1) * Number(limit);
  const [items, total] = await Promise.all([
    Package.find(filter).sort(sortMap[sort] || sortMap.popularity).skip(skip).limit(Number(limit)).populate('destination', 'name slug country').populate('category', 'name slug'),
    Package.countDocuments(filter)
  ]);
  res.json({ success: true, total, page: Number(page), pages: Math.ceil(total / Number(limit)), count: items.length, items });
});

// GET /api/packages/bestselling
export const bestSellingPackages = asyncHandler(async (req, res) => {
  const items = await Package.find({ bestSelling: true }).sort({ rating: -1 }).limit(Number(req.query.limit) || 12).populate('category', 'name slug');
  res.json({ success: true, items });
});

// GET /api/packages/trending
export const trendingPackages = asyncHandler(async (req, res) => {
  const items = await Package.find({ trending: true }).sort({ rating: -1 }).limit(Number(req.query.limit) || 12).populate('category', 'name slug');
  res.json({ success: true, items });
});

// GET /api/packages/category/:slug
export const packagesByCategory = asyncHandler(async (req, res) => {
  const category = await Category.findOne({ slug: req.params.slug });
  const { sort = 'popularity', page = 1, limit = 12 } = req.query;
  const filter = { ...buildFilter(req.query), categorySlug: req.params.slug };
  const skip = (Number(page) - 1) * Number(limit);
  const [items, total] = await Promise.all([
    Package.find(filter).sort(sortMap[sort] || sortMap.popularity).skip(skip).limit(Number(limit)),
    Package.countDocuments(filter)
  ]);
  res.json({ success: true, category, total, page: Number(page), pages: Math.ceil(total / Number(limit)), items });
});

// GET /api/packages/:slug
export const getPackage = asyncHandler(async (req, res) => {
  const pkg = await Package.findOne({ slug: req.params.slug }).populate('destination').populate('category', 'name slug');
  if (!pkg) return res.status(404).json({ success: false, message: 'Package not found' });
  const related = await Package.find({ _id: { $ne: pkg._id }, type: pkg.type }).limit(4);
  res.json({ success: true, package: pkg, related });
});

// Admin CRUD
export const createPackage = asyncHandler(async (req, res) => {
  const pkg = await Package.create(req.body);
  res.status(201).json({ success: true, package: pkg });
});
export const updatePackage = asyncHandler(async (req, res) => {
  const pkg = await Package.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!pkg) return res.status(404).json({ success: false, message: 'Package not found' });
  res.json({ success: true, package: pkg });
});
export const deletePackage = asyncHandler(async (req, res) => {
  await Package.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Package deleted' });
});
