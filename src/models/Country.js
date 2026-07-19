import mongoose from 'mongoose';
const countrySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true },
  code: String,
  continent: String,
  image: String,
  visaRequired: { type: Boolean, default: true }
}, { timestamps: true });
export default mongoose.model('Country', countrySchema);
