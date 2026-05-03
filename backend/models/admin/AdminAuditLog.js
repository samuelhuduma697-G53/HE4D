const mongoose = require('mongoose');

const adminAuditLogSchema = new mongoose.Schema({
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    index: true
  },
  adminEmail: {
    type: String,
    required: false,
    default: null
  },
  adminRole: {
    type: String,
    required: false,
    default: null
  },
  action: {
    type: String,
    required: true,
    enum: [
      'login', 'logout', 'login_failed', '2fa_verified', '2fa_failed',
      'password_reset', 'password_reset_request', 'admin_created',
      'admin_updated', 'admin_deleted', 'admin_invite_sent',
      'admin_invite_accepted', 'admin_invite_cancelled',
      'helper_verified', 'helper_rejected', 'safety_incident_reviewed',
      'crisis_escalated', 'system_setting_changed', 'data_exported',
      'session_terminated', 'all_sessions_terminated'
    ],
    index: true
  },
  resourceType: {
    type: String,
    enum: ['user', 'helper', 'crisis', 'safety', 'admin', 'system', 'settings']
  },
  resourceId: {
    type: String,
    index: true
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  ipAddress: {
    type: String,
    required: true
  },
  userAgent: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['success', 'failure', 'pending'],
    default: 'success',
    index: true
  },
  errorMessage: String
}, { timestamps: true });

adminAuditLogSchema.set('capped', { size: 1024 * 1024 * 500, max: 1000000 });
adminAuditLogSchema.index({ adminId: 1, createdAt: -1 });
adminAuditLogSchema.index({ action: 1, createdAt: -1 });

module.exports = mongoose.model('AdminAuditLog', adminAuditLogSchema);