import mongoose from 'mongoose';

const enquirySchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  destination: { type: String },
  packageName: { type: String },
  travelDate: { type: Date, required: true },
  travelers: { type: Number, required: true, min: 1 },
  specialRequirements: { type: String },
  packageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Package' },
  status: { 
    type: String, 
    enum: ['New', 'Contacted', 'Confirmed', 'Closed'], 
    default: 'New' 
  }
}, { timestamps: true });

export default mongoose.model('Enquiry', enquirySchema);
