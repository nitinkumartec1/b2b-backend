import Destination from '../models/Destination.js';
import Blog from '../models/Blog.js';
import Review from '../models/Review.js';
import Coupon from '../models/Coupon.js';
import Wallet from '../models/Wallet.js';
import Package from '../models/Package.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// Destinations
export const listDestinations = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.popular) filter.popular = true;
  if (req.query.type) filter.type = req.query.type;
  const items = await Destination.find(filter);
  res.json({ success: true, items });
});

// Blogs
export const listBlogs = asyncHandler(async (req, res) => {
  const limit = Number(req.query.limit) || 10;
  const items = await Blog.find({ published: true }).sort('-createdAt').limit(limit);
  res.json({ success: true, items });
});
export const getBlog = asyncHandler(async (req, res) => {
  const blog = await Blog.findOne({ slug: req.params.slug });
  if (!blog) return res.status(404).json({ success: false, message: 'Blog not found' });
  res.json({ success: true, blog });
});

// Reviews
export const listReviews = asyncHandler(async (req, res) => {
  const items = await Review.find({ package: req.params.packageId, approved: true }).sort('-createdAt');
  res.json({ success: true, items });
});
export const addReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const review = await Review.create({
    package: req.params.packageId, user: req.user._id, name: req.user.name, rating, comment
  });
  const agg = await Review.aggregate([
    { $match: { package: review.package, approved: true } },
    { $group: { _id: '$package', avg: { $avg: '$rating' }, count: { $sum: 1 } } }
  ]);
  if (agg[0]) await Package.findByIdAndUpdate(review.package, { rating: +agg[0].avg.toFixed(1), reviewCount: agg[0].count });
  res.status(201).json({ success: true, review });
});

// Coupons
export const validateCoupon = asyncHandler(async (req, res) => {
  const { code, amount } = req.body;
  const coupon = await Coupon.findOne({ code: code.toUpperCase(), active: true });
  if (!coupon) return res.status(404).json({ success: false, message: 'Invalid coupon' });
  if (coupon.expiresAt && coupon.expiresAt < new Date())
    return res.status(400).json({ success: false, message: 'Coupon expired' });
  if (amount < coupon.minAmount)
    return res.status(400).json({ success: false, message: `Minimum amount ${coupon.minAmount} required` });
  let discount = coupon.type === 'percent' ? (amount * coupon.value) / 100 : coupon.value;
  if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
  res.json({ success: true, coupon: { code: coupon.code, type: coupon.type, value: coupon.value }, discount: +discount.toFixed(2) });
});

// Wallet
export const getWallet = asyncHandler(async (req, res) => {
  let wallet = await Wallet.findOne({ user: req.user._id });
  if (!wallet) wallet = await Wallet.create({ user: req.user._id, balance: 0 });
  res.json({ success: true, wallet });
});
export const rechargeWallet = asyncHandler(async (req, res) => {
  const { amount, note } = req.body;
  let wallet = await Wallet.findOne({ user: req.user._id });
  if (!wallet) wallet = await Wallet.create({ user: req.user._id, balance: 0 });
  wallet.balance += Number(amount);
  wallet.transactions.push({ type: 'credit', amount: Number(amount), note: note || 'Wallet recharge' });
  await wallet.save();
  res.json({ success: true, wallet });
});
