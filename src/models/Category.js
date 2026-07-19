import mongoose from 'mongoose';
const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  image: String,
  description: String,
  startingPrice: { type: Number, default: 0 },
  packageCount: { type: Number, default: 0 },
  displayOrder: { type: Number, default: 0 },
  featured: { type: Boolean, default: false }
}, { timestamps: true });
export default mongoose.model('Category', categorySchema);
