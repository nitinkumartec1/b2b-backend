import mongoose from 'mongoose';
const txnSchema = new mongoose.Schema({
  type: { type: String, enum: ['credit', 'debit', 'cashback', 'commission', 'refund'], required: true },
  amount: { type: Number, required: true },
  note: String,
  ref: String
}, { timestamps: true });

const walletSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true, required: true },
  balance: { type: Number, default: 0 },
  transactions: [txnSchema]
}, { timestamps: true });
export default mongoose.model('Wallet', walletSchema);
