const mongoose = require('mongoose');

const guestSessionSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  guestToken: {
    type: String,
    required: true
  },
  name: {
    type: String,
    default: 'Guest User'
  },
  phone: {
    type: String,
    default: null
  },
  deviceId: {
    type: String,
    default: null
  },
  crisisCount: {
    type: Number,
    default: 0,
    min: 0
  },
  maxCrises: {
    type: Number,
    default: 1
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 } // Auto-delete after expiry
  },
  ipAddress: String,
  userAgent: String,
  migratedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  migratedAt: Date
}, { timestamps: true });

guestSessionSchema.index({ sessionId: 1, expiresAt: 1 });
guestSessionSchema.index({ deviceId: 1 });

// Check if guest can submit more crises
guestSessionSchema.methods.canSubmitCrisis = function() {
  return this.crisisCount < this.maxCrises && this.expiresAt > new Date();
};

// Increment crisis count
guestSessionSchema.methods.incrementCrisisCount = async function() {
  this.crisisCount += 1;
  await this.save();
  return this.crisisCount;
};

// Get remaining crises
guestSessionSchema.methods.getRemainingCrises = function() {
  return Math.max(0, this.maxCrises - this.crisisCount);
};

// Check if session is valid
guestSessionSchema.methods.isValid = function() {
  return this.expiresAt > new Date() && !this.migratedTo;
};

module.exports = mongoose.model('GuestSession', guestSessionSchema);