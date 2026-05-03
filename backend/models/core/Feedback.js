const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  matchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Match',
    required: true,
    index: true
  },
  fromId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  toId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  role: {
    type: String,
    enum: ['seeker', 'helper'],
    required: true
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  comment: {
    type: String,
    maxlength: 1000
  },
  tags: [{
    type: String,
    enum: ['professional', 'empathetic', 'quick_response', 'knowledgeable', 'safe']
  }],
  aiAccuracyRating: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

feedbackSchema.index({ fromId: 1 });
feedbackSchema.index({ toId: 1 });

module.exports = mongoose.model('Feedback', feedbackSchema);