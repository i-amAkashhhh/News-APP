import mongoose from 'mongoose';
const bookmarkSchema = new mongoose.Schema({
  title: { type: String, required: true, maxlength: 500 },
  description: { type: String, default: '', maxlength: 5000 },
  url: { type: String, required: true, unique: true, maxlength: 2000 },
  image: { type: String, default: '' },
  source: { type: String, default: '' },
  publishedAt: { type: String, default: '' }
}, { timestamps: true });
export default mongoose.model('Bookmark', bookmarkSchema);
