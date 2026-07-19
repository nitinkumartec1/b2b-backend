import mongoose from 'mongoose';
const reviewSchema = new mongoose.Schema({
  package: { type: mongoose.Schema.Types.ObjectId, ref: 'Package', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: String,
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: String,
  approved: { type: Boolean, default: true }
}, { timestamps: true });
export default mongoose.model('Review', reviewSchema);
