import mongoose from 'mongoose';
const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true },
  type: { type: String, enum: ['flat', 'percent'], default: 'percent' },
  value: { type: Number, required: true },
  minAmount: { type: Number, default: 0 },
  maxDiscount: { type: Number },
  expiresAt: Date,
  active: { type: Boolean, default: true },
  usageLimit: { type: Number, default: 0 },
  usedCount: { type: Number, default: 0 }
}, { timestamps: true });
export default mongoose.model('Coupon', couponSchema);
