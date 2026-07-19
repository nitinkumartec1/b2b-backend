import mongoose from 'mongoose';

const attractionSchema = new mongoose.Schema({ name: String, image: String, description: String }, { _id: false });
const faqSchema = new mongoose.Schema({ question: String, answer: String }, { _id: false });

const destinationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  country: { type: String, required: true },
  state: String,
  type: { type: String, enum: ['domestic', 'international'], default: 'domestic' },
  image: { type: String },          // card cover
  banner: { type: String },         // legacy banner
  heroImage: { type: String },      // hero banner
  gallery: [String],
  shortDescription: String,
  overview: String,
  tourCount: { type: Number, default: 0 },
  startingPrice: { type: Number, default: 0 },
  rating: { type: Number, default: 4.5 },
  reviewCount: { type: Number, default: 0 },
  bestTimeToVisit: String,
  weather: [{ month: String, temp: String, note: String }],
  topAttractions: [attractionSchema],
  thingsToDo: [String],
  travelTips: [String],
  mapEmbed: String,                 // lat,lng or embed url
  faqs: [faqSchema],
  displayOrder: { type: Number, default: 0 },
  featured: { type: Boolean, default: false },
  popular: { type: Boolean, default: false }
}, { timestamps: true });

destinationSchema.index({ popular: 1, displayOrder: 1 });
destinationSchema.index({ featured: 1 });
destinationSchema.index({ type: 1 });
destinationSchema.index({ country: 1 });

export default mongoose.model('Destination', destinationSchema);
