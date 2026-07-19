import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  bookingRef: { type: String, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  package: { type: mongoose.Schema.Types.ObjectId, ref: 'Package', required: true },
  travelDate: Date,
  travelers: { adults: { type: Number, default: 1 }, children: { type: Number, default: 0 } },
  amount: Number,
  discount: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  total: Number,
  couponCode: String,
  paymentType: { type: String, enum: ['full', 'partial', 'wallet', 'credit'], default: 'full' },
  paidAmount: { type: Number, default: 0 },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'partial', 'refunded'], default: 'pending' },
  status: { type: String, enum: ['requested', 'confirmed', 'cancelled', 'completed'], default: 'requested' },
  contact: { name: String, email: String, phone: String },
  notes: String
}, { timestamps: true });

bookingSchema.pre('validate', function (next) {
  if (!this.bookingRef) this.bookingRef = 'B2B' + Date.now().toString(36).toUpperCase();
  next();
});

export default mongoose.model('Booking', bookingSchema);
