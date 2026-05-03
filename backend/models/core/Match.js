const mongoose = require('mongoose');
const constants = require('../../config/constants');

const matchSchema = new mongoose.Schema({
  crisisId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Crisis',
    required: true,
    unique: true,
    index: true
  },
  seekerId: {
    type: mongoose.Schema.Types.Mixed,
    ref: 'User',
    required: true,
    index: true
  },
  helperId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  matchScore: {
    type: Number,
    min: 0,
    max: 100,
    required: true
  },
  distance: {
    type: Number,
    required: true
  },
  eta: {
    type: Number,
    default: null
  },
  communication: {
    lastMessageAt: Date,
    messageCount: { type: Number, default: 0 },
    unreadCount: {
      seeker: { type: Number, default: 0 },
      helper: { type: Number, default: 0 }
    }
  },
  journey: {
    helperLocationHistory: [{
      coordinates: [Number],
      timestamp: Date,
      accuracy: Number
    }],
    helperArrivedAt: Date,
    completedAt: Date
  },
  status: {
    type: String,
    enum: Object.values(constants.MATCH_STATUS),
    default: constants.MATCH_STATUS.PENDING,
    index: true
  },
  timeline: [{
    action: {
      type: String,
      enum: ['matched', 'accepted', 'declined', 'arrived', 'completed', 'expired']
    },
    timestamp: { type: Date, default: Date.now },
    details: mongoose.Schema.Types.Mixed
  }],
  feedback: {
    seekerRating: { type: Number, min: 1, max: 5 },
    seekerComment: String,
    helperRating: { type: Number, min: 1, max: 5 },
    helperComment: String,
    createdAt: Date
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 2 * 60 * 60 * 1000),
    index: { expires: 0 }
  }
}, { timestamps: true });

matchSchema.index({ helperId: 1, status: 1 });
matchSchema.index({ seekerId: 1, status: 1 });

matchSchema.methods.addTimelineEntry = async function(action, details = {}) {
  this.timeline.push({ action, timestamp: new Date(), details });
  await this.save();
};

matchSchema.methods.accept = async function() {
  this.status = constants.MATCH_STATUS.ACCEPTED;
  await this.addTimelineEntry('accepted');
};

matchSchema.methods.decline = async function(reason) {
  this.status = constants.MATCH_STATUS.DECLINED;
  await this.addTimelineEntry('declined', { reason });
};

matchSchema.methods.recordArrival = async function(coordinates) {
  this.journey.helperArrivedAt = new Date();
  if (coordinates) {
    this.journey.helperLocationHistory.push({ coordinates, timestamp: new Date(), accuracy: 10 });
  }
  await this.addTimelineEntry('arrived', { coordinates });
};

matchSchema.methods.complete = async function() {
  this.status = constants.MATCH_STATUS.COMPLETED;
  this.journey.completedAt = new Date();
  await this.addTimelineEntry('completed');
};

matchSchema.methods.addFeedback = async function(userRole, rating, comment) {
  if (userRole === 'seeker') {
    this.feedback.seekerRating = rating;
    this.feedback.seekerComment = comment;
  } else if (userRole === 'helper') {
    this.feedback.helperRating = rating;
    this.feedback.helperComment = comment;
  }
  this.feedback.createdAt = new Date();
  await this.save();
};

matchSchema.methods.getDuration = function() {
  if (!this.journey.completedAt) return null;
  return this.journey.completedAt - this.createdAt;
};

module.exports = mongoose.model('Match', matchSchema);