import mongoose from 'mongoose';
const citySchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  state: String,
  country: { type: mongoose.Schema.Types.ObjectId, ref: 'Country' },
  countryName: String
}, { timestamps: true });
export default mongoose.model('City', citySchema);
