const mongoose = require('mongoose');

const successStorySchema = new mongoose.Schema({
  title: { type: String, required: true, maxlength: 100 },
  content: { type: String, required: true, maxlength: 2000 },
  author: { type: String, required: true },
  role: { type: String, enum: ['seeker', 'helper'], required: true },
  crisisId: { type: mongoose.Schema.Types.ObjectId, ref: 'Crisis' },
  rating: { type: Number, min: 1, max: 5, default: 5 },
  isPublished: { type: Boolean, default: false },
  adminVerified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

successStorySchema.index({ isPublished: 1, createdAt: -1 });

module.exports = mongoose.model('SuccessStory', successStorySchema);
