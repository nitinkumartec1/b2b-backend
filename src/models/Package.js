import mongoose from 'mongoose';

const itineraryDaySchema = new mongoose.Schema({
  day: Number, title: String, description: String
}, { _id: false });

const packageSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  destination: { type: mongoose.Schema.Types.ObjectId, ref: 'Destination' },
  country: String,
  city: String,
  type: { type: String, enum: ['domestic', 'international'], default: 'domestic' },
  theme: [{ type: String }], // luxury, family, honeymoon, adventure, corporate, pilgrimage, weekend, cruise
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  categorySlug: { type: String },
  flightIncluded: { type: Boolean, default: false },
  mealPlan: { type: String, default: 'Breakfast' },
  trending: { type: Boolean, default: false },
  displayOrder: { type: Number, default: 0 },
  summary: String,
  description: String,
  highlights: [String],
  itinerary: [itineraryDaySchema],
  inclusions: [String],
  exclusions: [String],
  terms: [String],
  cancellationPolicy: String,
  thumbnail: String,
  coverImage: String,
  gallery: [String],
  images: [String], // legacy
  video: String,
  durationDays: { type: Number, default: 1 },
  durationNights: { type: Number, default: 0 },
  hotelRating: { type: Number, default: 3 },
  price: { type: Number, required: true },
  discountPrice: { type: Number },
  meals: String,
  transport: String,
  visaIncluded: { type: Boolean, default: false },
  availableDates: [Date],
  fixedDeparture: { type: Boolean, default: false },
  featured: { type: Boolean, default: false },
  popular: { type: Boolean, default: false },
  bestSelling: { type: Boolean, default: false },
  tags: [String],
  seo: { metaTitle: String, metaDescription: String, keywords: [String] },
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 }
}, { timestamps: true });

packageSchema.index({ title: 'text', summary: 'text', tags: 'text', country: 'text', city: 'text' });
packageSchema.index({ bestSelling: 1, rating: -1 });
packageSchema.index({ trending: 1, rating: -1 });
packageSchema.index({ popular: -1, rating: -1 });
packageSchema.index({ fixedDeparture: 1 });
packageSchema.index({ featured: 1 });
packageSchema.index({ categorySlug: 1 });
packageSchema.index({ type: 1, price: 1 });

export default mongoose.model('Package', packageSchema);
