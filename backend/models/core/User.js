const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  title: {
    type: String,
    enum: ['Mr.', 'Mrs.', 'Ms.', 'Dr.', 'Prof.', 'Pastor', 'Imam', 'Clergy', 'Counselor'],
    default: 'Mr.'
  },
  email: { type: String, required: true, unique: true, lowercase: true, index: true },
  phone: { type: String, required: true, unique: true, index: true },
  passwordHash: { type: String, required: true, select: false },
  
  role: { 
    type: String, 
    enum: ['seeker', 'helper', 'admin'], 
    default: 'seeker',
    index: true 
  },

  profile: {
    dateOfBirth: Date,
    gender: { type: String, enum: ['Male', 'Female', 'Other', 'Prefer not to say'] },
    bio: { type: String, maxlength: 500 },
    profileImage: String,
    languages: [{ type: String, enum: ['english', 'swahili', 'sheng'] }]
  },

  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [39.85, -3.63] },
    county: { type: String, default: 'Kilifi' },
    subCounty: String,
    ward: { type: String, index: true },
    address: String
  },

  helperProfile: {
    nationalId: { type: String, sparse: true, unique: true },
    experienceType: {
      type: String,
      enum: ['Professional', 'Peer Support (Lived Experience)']
    },
    yearsOfExperience: { type: Number, default: 0 },
    professionalType: String,
    licenseNumber: String,
    specializations: [String],
    verificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected', 'suspended'],
      default: 'pending'
    },
    isAvailable: { type: Boolean, default: false },
    trustScore: { type: Number, default: 5.0, min: 0, max: 5 },
    totalCases: { type: Number, default: 0 },
    resolvedCases: { type: Number, default: 0 },
    emergencyContacts: [{
      name: String,
      phone: String,
      relationship: String
    }],
    maxResponseDistance: { type: Number, default: 20 }
  },

  isActive: { type: Boolean, default: true, index: true },
  isEmailVerified: { type: Boolean, default: false },
  isPhoneVerified: { type: Boolean, default: false },
  lastLoginAt: Date,
  failedAttempts: { type: Number, default: 0 },
  lockedUntil: Date,
  passwordResetToken: String,
  passwordResetExpires: Date
  
}, { timestamps: true });

// Indexes
userSchema.index({ location: '2dsphere' });
userSchema.index({ 'helperProfile.verificationStatus': 1 });
userSchema.index({ 'helperProfile.isAvailable': 1 });

// Password hashing
userSchema.pre('save', async function(next) {
  if (!this.isModified('passwordHash')) return next();
  this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
  next();
});

// Compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

// Record failed attempt
userSchema.methods.recordFailedAttempt = async function() {
  this.failedAttempts += 1;
  if (this.failedAttempts >= 5) {
    this.lockedUntil = new Date(Date.now() + 30 * 60 * 1000);
  }
  return this.save();
};

// Reset failed attempts
userSchema.methods.resetFailedAttempts = async function() {
  this.failedAttempts = 0;
  this.lockedUntil = null;
  return this.save();
};

// Virtual for id
userSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

// To JSON
userSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    delete ret.passwordHash;
    delete ret.passwordResetToken;
    delete ret.passwordResetExpires;
    delete ret.__v;
    return ret;
    
  }
});

module.exports = mongoose.model('User', userSchema);