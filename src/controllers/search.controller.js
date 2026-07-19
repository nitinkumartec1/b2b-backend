import Package from '../models/Package.js';
import Destination from '../models/Destination.js';
import Category from '../models/Category.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// GET /api/search?q=&type=&theme=&minPrice=&maxPrice=&hotelRating=&flightIncluded=&visaIncluded=&sort=
export const globalSearch = asyncHandler(async (req, res) => {
  const { q } = req.query;
  const rx = q ? new RegExp(q, 'i') : null;
  const pkgFilter = {};
  if (q) pkgFilter.$or = [{ title: rx }, { country: rx }, { city: rx }, { tags: rx }];
  const [packages, destinations, categories] = await Promise.all([
    Package.find(pkgFilter).limit(12).populate('category', 'name slug'),
    rx ? Destination.find({ $or: [{ name: rx }, { country: rx }] }).limit(6) : [],
    rx ? Category.find({ name: rx }).limit(6) : []
  ]);
  res.json({ success: true, results: { packages, destinations, categories }, counts: { packages: packages.length, destinations: destinations.length, categories: categories.length } });
});
