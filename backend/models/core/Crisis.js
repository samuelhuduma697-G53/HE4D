/**
 * Crisis Model - Huduma Ecosystem
 * Manages crisis reports, AI triage results, and full lifecycle tracking
 * Supports both registered seekers and guest (try-before-register) sessions
 */

const mongoose = require('mongoose');
const constants = require('../../config/constants');

const crisisSchema = new mongoose.Schema({
  // ========================================================================
  // SEEKER IDENTIFICATION (Supports both registered users and guest sessions)
  // ========================================================================
  seekerId: {
    type: String,                           // Changed from ObjectId to String to support guest session IDs
    required: true,
    index: true
  },

  // ========================================================================
  // CRISIS INPUT
  // ========================================================================
  rawInput: {
    type: String,
    required: true,
    maxlength: 5000                         // 5000 character limit for crisis descriptions
  },

  language: {
    type: String,
    enum: ['english', 'swahili', 'sheng', 'mixed'],
    default: 'english'
  },

  // ========================================================================
  // AI TRIAGE RESULTS
  // ========================================================================
  triage: {
    acuityScore: {
      type: Number,
      min: 0,
      max: 10,
      required: true,
      index: true                          // Indexed for queue sorting
    },
    severity: {
      type: String,
      enum: ['critical', 'high', 'moderate', 'low'],
      required: true
    },
    detectedDialect: {
      type: String,
      enum: ['standard_swahili', 'coastal_swahili', 'sheng_nairobi', 'sheng_pwani', 'english']
    },
    categories: [{
      type: String,
      enum: [
        'mental_health',
        'domestic_violence',
        'legal',
        'medical',
        'financial',
        'housing',
        'substance_abuse',
        'suicide_risk',
        'trauma',
        'emergency',
        'other'
      ]
    }],
    keywords: [String],                     // Extracted crisis keywords
    requiresImmediate: {
      type: Boolean,
      default: false
    },
    recommendedAction: {
      type: String,
      enum: ['immediate_response', 'urgent_triage', 'standard_triage', 'scheduled_support']
    },
    confidence: {
      type: Number,
      min: 0,
      max: 1,
      default: 0
    }
  },

  // ========================================================================
  // LOCATION INFORMATION (Kilifi/Coast region focus)
  // ========================================================================
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],                       // [longitude, latitude]
      required: true
    },
    county: {
      type: String,
      default: 'Kilifi'
    },
    subCounty: {
      type: String,
      required: true
    },
    ward: {
      type: String,
      required: true,
      index: true                           // Indexed for ward-level matching
    },
    address: String,
    accuracy: Number                        // GPS accuracy in meters
  },

  // ========================================================================
  // MATCHING INFORMATION
  // ========================================================================
  match: {
    helperId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true
    },
    matchScore: Number,                     // AI-calculated fitness score
    distance: Number,                       // Distance in kilometers
    assignedAt: Date,
    acceptedAt: Date,
    arrivedAt: Date,
    completedAt: Date
  },

  // ========================================================================
  // STATUS AND TIMELINE
  // ========================================================================
  status: {
    type: String,
    enum: [
      'pending',
      'triaging',
      'matching',
      'assigned',
      'in_progress',
      'resolved',
      'escalated',
      'critical',
      'expired'
    ],
    default: 'pending',
    index: true
  },

  timeline: [{
    status: {
      type: String,
      enum: [
        'pending',
        'triaging',
        'matching',
        'assigned',
        'in_progress',
        'resolved',
        'escalated',
        'critical',
        'expired',
        'helper_arrived',
        'helper_departed',
        'cancelled'
      ]
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    note: String,
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],

  // ========================================================================
  // COMMUNICATION (Chat History)
  // ========================================================================
  chatHistory: [{
    senderId: {
      type: String,                         // String to support guest session IDs
      required: true
    },
    senderRole: {
      type: String,
      enum: ['seeker', 'helper', 'system', 'guest'],
      default: 'seeker'
    },
    message: String,
    type: {
      type: String,
      enum: ['text', 'image', 'location', 'system'],
      default: 'text'
    },
    mediaUrl: String,
    location: {
      latitude: Number,
      longitude: Number,
      accuracy: Number
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    read: {
      type: Boolean,
      default: false
    }
  }],

  // ========================================================================
  // RESOLUTION
  // ========================================================================
  resolution: {
    resolvedAt: Date,
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    outcome: String,
    notes: String,
    feedback: {
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      comment: String,
      categories: [String],
      createdAt: Date
    }
  },

  // ========================================================================
  // SAFETY FLAGS
  // ========================================================================
  safetyFlags: [{
    type: {
      type: String,
      enum: ['violence', 'self_harm', 'suicide', 'abuse', 'medical', 'emergency']
    },
    severity: {
      type: String,
      enum: ['critical', 'high', 'moderate']
    },
    alertedAt: {
      type: Date,
      default: Date.now
    },
    escalatedTo: [{
      type: String,
      enum: ['admin', 'police', 'ambulance', 'supervisor', 'backup_helper', 'emergency_services']
    }]
  }],

  // ========================================================================
  // METADATA (Guest Session Support, Anonymity, Migration Tracking)
  // ========================================================================
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
    // Possible fields stored here:
    // {
    //   isGuestSession: Boolean,           // Whether crisis was submitted by a guest
    //   guestSessionId: String,            // The guest session identifier
    //   isAnonymous: Boolean,             // Whether seeker chose anonymous submission
    //   submittedAt: Date,                // Exact submission timestamp
    //   migratedFromGuest: Boolean,       // Whether this crisis was migrated from guest account
    //   originalSessionId: String,        // Original guest session ID before migration
    //   migratedAt: Date,                 // When the migration occurred
    //   deviceId: String,                 // Device fingerprint
    //   ipAddress: String,                // IP address at submission time
    //   userAgent: String                 // Browser/device info
    // }
  },

  // ========================================================================
  // EXPIRY (TTL Index for auto-cleanup of unresolved crises)
  // ========================================================================
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 24 * 60 * 60 * 1000),  // 24 hours
    index: { expires: 0 }                 // MongoDB TTL - auto-delete after expiry
  }
}, {
  timestamps: true,                       // Adds createdAt and updatedAt automatically
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ============================================================================
// INDEXES
// ============================================================================

// Geospatial index for proximity-based queries
crisisSchema.index({ location: '2dsphere' });

// Compound index for crisis queue (helpers see highest acuity first)
crisisSchema.index({ status: 1, 'triage.acuityScore': -1 });

// Index for helper's assigned crises
crisisSchema.index({ 'match.helperId': 1, status: 1 });

// Index for seeker's crisis history
crisisSchema.index({ seekerId: 1, createdAt: -1 });

// Index for guest session crises
crisisSchema.index({ 'metadata.guestSessionId': 1 });

// Index for ward-level analytics
crisisSchema.index({ 'location.ward': 1, status: 1 });

// Index for county-level reporting
crisisSchema.index({ 'location.county': 1, createdAt: -1 });

// Index for severity-based queries
crisisSchema.index({ 'triage.severity': 1, status: 1 });

// ============================================================================
// VIRTUALS
// ============================================================================

// Check if crisis was submitted by a guest
crisisSchema.virtual('isGuestCrisis').get(function() {
  return this.metadata?.isGuestSession === true;
});

// Check if crisis was migrated from a guest session
crisisSchema.virtual('isMigratedFromGuest').get(function() {
  return this.metadata?.migratedFromGuest === true;
});

// Get crisis age in minutes
crisisSchema.virtual('ageInMinutes').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60));
});

// ============================================================================
// METHODS
// ============================================================================

/**
 * Add timeline entry and update status
 */
crisisSchema.methods.addTimelineEntry = async function(status, note, actorId = null) {
  this.timeline.push({
    status,
    timestamp: new Date(),
    note,
    actor: actorId
  });
  this.status = status;
  this.updatedAt = new Date();
  return this.save();
};

/**
 * Assign helper to crisis
 */
crisisSchema.methods.assignHelper = async function(helperId, matchScore, distance) {
  this.match = {
    helperId,
    matchScore,
    distance,
    assignedAt: new Date()
  };
  this.status = constants.CRISIS_STATUS.ASSIGNED;
  return this.addTimelineEntry(
    constants.CRISIS_STATUS.ASSIGNED,
    `Assigned to helper ${helperId}`
  );
};

/**
 * Accept crisis by helper
 */
crisisSchema.methods.acceptByHelper = async function(helperId) {
  if (this.match.helperId?.toString() !== helperId.toString()) {
    throw new Error('Helper not assigned to this crisis');
  }
  this.match.acceptedAt = new Date();
  this.status = constants.CRISIS_STATUS.IN_PROGRESS;
  return this.addTimelineEntry(
    constants.CRISIS_STATUS.IN_PROGRESS,
    'Crisis accepted by helper'
  );
};

/**
 * Record helper arrival at location
 */
crisisSchema.methods.recordHelperArrival = async function(helperId) {
  this.match.arrivedAt = new Date();
  return this.addTimelineEntry(
    'helper_arrived',
    'Helper arrived at seeker location',
    helperId
  );
};

/**
 * Resolve crisis
 */
crisisSchema.methods.resolve = async function(helperId, outcome, notes) {
  this.resolution = {
    resolvedAt: new Date(),
    resolvedBy: helperId,
    outcome,
    notes
  };
  this.status = constants.CRISIS_STATUS.RESOLVED;
  return this.addTimelineEntry(
    constants.CRISIS_STATUS.RESOLVED,
    `Crisis resolved: ${outcome}`
  );
};

/**
 * Add feedback to resolved crisis
 */
crisisSchema.methods.addFeedback = async function(rating, comment, categories = []) {
  if (this.status !== constants.CRISIS_STATUS.RESOLVED) {
    throw new Error('Can only add feedback to resolved crises');
  }
  
  this.resolution.feedback = {
    rating,
    comment,
    categories,
    createdAt: new Date()
  };
  
  return this.save();
};

/**
 * Add safety flag to crisis
 */
crisisSchema.methods.addSafetyFlag = async function(type, severity, escalatedTo = []) {
  this.safetyFlags.push({
    type,
    severity,
    alertedAt: new Date(),
    escalatedTo
  });
  
  if (severity === 'critical') {
    this.triage.requiresImmediate = true;
  }
  
  return this.save();
};

/**
 * Add chat message to crisis
 */
crisisSchema.methods.addChatMessage = async function(senderId, message, type = 'text', senderRole = null) {
  this.chatHistory.push({
    senderId,
    senderRole: senderRole || 'seeker',
    message,
    type,
    timestamp: new Date()
  });
  
  return this.save();
};

/**
 * Get acuity level label
 */
crisisSchema.methods.getAcuityLevel = function() {
  const score = this.triage.acuityScore;
  if (score >= 8) return 'critical';
  if (score >= 6) return 'high';
  if (score >= 4) return 'moderate';
  return 'low';
};

/**
 * Get acuity color for UI
 */
crisisSchema.methods.getAcuityColor = function() {
  const level = this.getAcuityLevel();
  const colors = {
    critical: '#dc2626',
    high: '#f97316',
    moderate: '#eab308',
    low: '#22c55e'
  };
  return colors[level];
};

/**
 * Check if crisis is active (not resolved or expired)
 */
crisisSchema.methods.isActive = function() {
  return ![
    constants.CRISIS_STATUS.RESOLVED,
    constants.CRISIS_STATUS.EXPIRED
  ].includes(this.status);
};

/**
 * Check if crisis needs immediate attention
 */
crisisSchema.methods.needsImmediateAttention = function() { if (!this.safetyFlags) return false;
  return this.triage.requiresImmediate || 
         this.getAcuityLevel() === 'critical' ||
         this.safetyFlags.some(f => f.severity === 'critical');
};

/**
 * Get response time in minutes (from submission to helper acceptance)
 */
crisisSchema.methods.getResponseTime = function() {
  if (!this.match.acceptedAt) return null;
  return Math.floor((this.match.acceptedAt - this.createdAt) / (1000 * 60));
};

/**
 * Get resolution time in minutes (from submission to resolution)
 */
crisisSchema.methods.getResolutionTime = function() {
  if (!this.resolution?.resolvedAt) return null;
  return Math.floor((this.resolution.resolvedAt - this.createdAt) / (1000 * 60));
};

/**
 * Migrate crisis from guest to registered user
 */
crisisSchema.methods.migrateFromGuest = async function(userId, guestSessionId) {
  this.seekerId = userId.toString();
  this.metadata = {
    ...this.metadata,
    migratedFromGuest: true,
    originalSessionId: guestSessionId,
    migratedAt: new Date()
  };
  
  return this.save();
};

/**
 * Check if crisis was submitted by a guest
 */
crisisSchema.methods.wasSubmittedByGuest = function() {
  return this.metadata?.isGuestSession === true;
};

/**
 * Get summary for dashboard/queue display
 */
crisisSchema.methods.getSummary = function() {
  return {
    id: this._id,
    acuityScore: this.triage.acuityScore,
    severity: this.triage.severity,
    categories: this.triage.categories,
    status: this.status,
    location: {
      ward: this.location.ward,
      subCounty: this.location.subCounty,
      county: this.location.county
    },
    isGuest: this.wasSubmittedByGuest(),
    ageInMinutes: this.ageInMinutes,
    needsImmediate: this.needsImmediateAttention()
  };
};

// ============================================================================
// STATICS
// ============================================================================

/**
 * Get crisis statistics for a time period
 */
crisisSchema.statics.getStats = async function(startDate, endDate) {
  const match = {};
  if (startDate) match.createdAt = { $gte: new Date(startDate) };
  if (endDate) match.createdAt = { ...match.createdAt, $lte: new Date(endDate) };

  return this.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        avgAcuity: { $avg: '$triage.acuityScore' },
        avgResponseTime: { $avg: '$match.responseTime' }
      }
    }
  ]);
};

/**
 * Get crises by ward (for Kilifi pilot analytics)
 */
crisisSchema.statics.getByWard = async function(ward, startDate) {
  const query = { 'location.ward': ward };
  if (startDate) query.createdAt = { $gte: new Date(startDate) };

  return this.find(query)
    .sort({ createdAt: -1 })
    .select('triage.acuityScore triage.severity status createdAt');
};

/**
 * Count crises by severity for dashboard
 */
crisisSchema.statics.countBySeverity = async function(days = 30) {
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  return this.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: '$triage.severity',
        count: { $sum: 1 }
      }
    }
  ]);
};

/**
 * Get weekly trend data
 */
crisisSchema.statics.getWeeklyTrend = async function() {
  const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  return this.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
        },
        count: { $sum: 1 },
        avgAcuity: { $avg: '$triage.acuityScore' }
      }
    },
    { $sort: { _id: 1 } }
  ]);
};

// ============================================================================
// PRE-SAVE HOOKS
// ============================================================================

// Update timestamps and validate data before saving
crisisSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // Ensure expiresAt is set for active crises
  if (this.isActive() && !this.expiresAt) {
    this.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  }
  
  next();
});

// ============================================================================
// TO JSON TRANSFORM
// ============================================================================

crisisSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    delete ret.__v;
    
    // Format dates for API responses
    if (ret.createdAt) ret.createdAt = ret.createdAt.toISOString();
    if (ret.updatedAt) ret.updatedAt = ret.updatedAt.toISOString();
    if (ret.expiresAt) ret.expiresAt = ret.expiresAt.toISOString();
    
    // Include virtual fields
    ret.isGuestCrisis = doc.isGuestCrisis;
    ret.ageInMinutes = doc.ageInMinutes;
    ret.acuityLevel = doc.getAcuityLevel();
    ret.acuityColor = doc.getAcuityColor();
    ret.needsImmediate = doc.needsImmediateAttention ? doc.needsImmediateAttention() : false;
    
    return ret;
  }
});

// ============================================================================
// EXPORT
// ============================================================================

module.exports = mongoose.model('Crisis', crisisSchema);