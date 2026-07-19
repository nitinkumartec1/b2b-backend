import mongoose from 'mongoose';
const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  excerpt: String,
  content: String,
  cover: String,
  author: String,
  category: String,
  tags: [String],
  published: { type: Boolean, default: true },
  seo: { metaTitle: String, metaDescription: String }
}, { timestamps: true });
export default mongoose.model('Blog', blogSchema);
