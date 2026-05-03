const mongoose = require('mongoose');
const constants = require('../../config/constants');

const adminSessionSchema = new mongoose.Schema({
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true,
    index: true
  },
  token: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  refreshToken: {
    type: String,
    required: true,
    unique: true
  },
  ipAddress: {
    type: String,
    required: true
  },
  userAgent: {
    type: String,
    required: true
  },
  location: {
    city: String,
    country: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  twoFAVerified: {
    type: Boolean,
    default: false
  },
  expiresAt: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + constants.SESSION.ADMIN_SESSION_TIMEOUT),
    index: { expires: 0 }
  },
  lastActivityAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  terminatedAt: Date,
  terminatedBy: {
    type: String,
    enum: ['user', 'system', 'admin']
  }
}, { timestamps: true });

adminSessionSchema.methods.updateActivity = async function() {
  this.lastActivityAt = new Date();
  await this.save();
};

adminSessionSchema.methods.terminate = async function(terminatedBy = 'user') {
  this.isActive = false;
  this.terminatedAt = new Date();
  this.terminatedBy = terminatedBy;
  await this.save();
};

adminSessionSchema.methods.isExpired = function() {
  return this.expiresAt < new Date();
};

adminSessionSchema.methods.mark2FAVerified = async function() {
  this.twoFAVerified = true;
  await this.save();
};

adminSessionSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.token;
    delete ret.refreshToken;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('AdminSession', adminSessionSchema);