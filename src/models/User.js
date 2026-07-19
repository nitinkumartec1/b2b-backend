import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
  password: { type: String, minlength: 6, select: false },
  phone: { type: String, unique: true, sparse: true },
  role: { type: String, enum: ['user', 'agent', 'admin'], default: 'user' },
  agencyName: { type: String },
  approved: { type: Boolean, default: true }, // agents may require approval
  creditLimit: { type: Number, default: 0 },
  markupPercent: { type: Number, default: 0 },
  avatar: { type: String },
  isVerified: { type: Boolean, default: false },
  refreshTokens: [{ type: String, select: false }]
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.matchPassword = function (entered) {
  return bcrypt.compare(entered, this.password);
};

export default mongoose.model('User', userSchema);
