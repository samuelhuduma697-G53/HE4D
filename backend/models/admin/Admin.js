const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const constants = require('../../config/constants');

const adminRoleSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: Object.values(constants.ADMIN_ROLES),
    required: true
  },
  permissions: [{
    type: String,
    enum: Object.values(constants.ADMIN_PERMISSIONS)
  }],
  hierarchyLevel: {
    type: Number,
    default: function() {
      const levels = {
        [constants.ADMIN_ROLES.SUPER_ADMIN]: 100,
        [constants.ADMIN_ROLES.SENIOR_ADMIN]: 80,
        [constants.ADMIN_ROLES.VERIFICATION_ADMIN]: 50,
        [constants.ADMIN_ROLES.SAFETY_ADMIN]: 50,
        [constants.ADMIN_ROLES.CONTENT_ADMIN]: 40
      };
      return levels[this.role];
    }
  }
});

const adminSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 50
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  role: {
    type: adminRoleSchema,
    required: true
  },
  assignedRegion: {
    type: String,
    default: 'Kilifi'
  },
  profileImage: String,
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  isLocked: {
    type: Boolean,
    default: false
  },
  failedAttempts: {
    type: Number,
    default: 0
  },
  lastFailedAttempt: Date,
  lockedUntil: Date,
  lastLoginAt: Date,
  lastLoginIp: String,
  passwordResetToken: String,
  passwordResetExpires: Date,
  twoFAEnabled: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: false,
    default: null
  }
}, { timestamps: true });

// Removed duplicate index - email has index:true on field
// Kept for compound queries
// Removed duplicate index - isActive has index:true on field
adminSchema.pre('save', async function(next) {
  if (!this.isModified('passwordHash')) return next();
  const salt = await bcrypt.genSalt(12);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
  next();
});

adminSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

adminSchema.methods.recordFailedAttempt = async function() {
  this.failedAttempts += 1;
  this.lastFailedAttempt = new Date();
  if (this.failedAttempts >= 5) {
    this.isLocked = true;
    this.lockedUntil = new Date(Date.now() + 30 * 60 * 1000);
  }
  await this.save();
};

adminSchema.methods.resetFailedAttempts = async function() {
  this.failedAttempts = 0;
  this.lastFailedAttempt = null;
  this.isLocked = false;
  this.lockedUntil = null;
  await this.save();
};

adminSchema.methods.isAccountLocked = function() {
  if (this.lockedUntil && this.lockedUntil > new Date()) {
    return true;
  }
  return this.isLocked;
};

adminSchema.methods.hasPermission = function(permission) {
  if (this.role.role === constants.ADMIN_ROLES.SUPER_ADMIN) return true;
  return this.role.permissions.includes(permission);
};

adminSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.passwordHash;
    delete ret.passwordResetToken;
    delete ret.passwordResetExpires;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Admin', adminSchema);