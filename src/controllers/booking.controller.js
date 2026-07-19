import Booking from '../models/Booking.js';
import Package from '../models/Package.js';
import Coupon from '../models/Coupon.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const computeTotals = (basePrice, travelers, coupon) => {
  const adults = travelers?.adults || 1;
  const children = travelers?.children || 0;
  const amount = basePrice * adults + basePrice * 0.6 * children;
  let discount = 0;
  if (coupon) {
    discount = coupon.type === 'percent' ? (amount * coupon.value) / 100 : coupon.value;
    if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
  }
  const taxable = Math.max(amount - discount, 0);
  const tax = +(taxable * 0.05).toFixed(2); // 5% GST
  const total = +(taxable + tax).toFixed(2);
  return { amount: +amount.toFixed(2), discount: +discount.toFixed(2), tax, total };
};

export const createBooking = asyncHandler(async (req, res) => {
  const { packageId, travelDate, travelers, couponCode, paymentType, contact, notes } = req.body;
  const pkg = await Package.findById(packageId);
  if (!pkg) return res.status(404).json({ success: false, message: 'Package not found' });

  let coupon = null;
  if (couponCode) {
    coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), active: true });
  }
  const base = pkg.discountPrice || pkg.price;
  const totals = computeTotals(base, travelers, coupon);

  const booking = await Booking.create({
    user: req.user._id, package: pkg._id, travelDate, travelers,
    ...totals, couponCode: coupon?.code, paymentType: paymentType || 'full',
    contact, notes, status: paymentType === 'partial' ? 'requested' : 'confirmed',
    paymentStatus: 'pending'
  });
  res.status(201).json({ success: true, booking });
});

export const myBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ user: req.user._id }).populate('package', 'title slug images price').sort('-createdAt');
  res.json({ success: true, bookings });
});

export const getBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id).populate('package').populate('user', 'name email');
  if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
  res.json({ success: true, booking });
});

export const updateBookingStatus = asyncHandler(async (req, res) => {
  const { status, paymentStatus } = req.body;
  const booking = await Booking.findByIdAndUpdate(req.params.id, { status, paymentStatus }, { new: true });
  res.json({ success: true, booking });
});
