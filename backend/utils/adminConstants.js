/**
 * Admin Constants
 * Admin-specific configuration and role definitions
 */

const constants = require('./constants');

module.exports = {
  // Admin Role Hierarchy (higher number = more permissions)
  ROLE_HIERARCHY: {
    [constants.ADMIN_ROLES.SUPER_ADMIN]: 100,
    [constants.ADMIN_ROLES.SENIOR_ADMIN]: 80,
    [constants.ADMIN_ROLES.VERIFICATION_ADMIN]: 50,
    [constants.ADMIN_ROLES.SAFETY_ADMIN]: 50,
    [constants.ADMIN_ROLES.CONTENT_ADMIN]: 40
  },

  // Role Display Names
  ROLE_DISPLAY_NAMES: {
    [constants.ADMIN_ROLES.SUPER_ADMIN]: 'Super Administrator',
    [constants.ADMIN_ROLES.SENIOR_ADMIN]: 'Senior Administrator',
    [constants.ADMIN_ROLES.VERIFICATION_ADMIN]: 'Verification Administrator',
    [constants.ADMIN_ROLES.SAFETY_ADMIN]: 'Safety Administrator',
    [constants.ADMIN_ROLES.CONTENT_ADMIN]: 'Content Administrator'
  },

  // Role Descriptions
  ROLE_DESCRIPTIONS: {
    [constants.ADMIN_ROLES.SUPER_ADMIN]: 'Full system access, can manage all aspects of the platform',
    [constants.ADMIN_ROLES.SENIOR_ADMIN]: 'Operational management, user oversight, and system monitoring',
    [constants.ADMIN_ROLES.VERIFICATION_ADMIN]: 'Helper verification, document review, and IPRS checks',
    [constants.ADMIN_ROLES.SAFETY_ADMIN]: 'Safety incident management, escalation, and emergency coordination',
    [constants.ADMIN_ROLES.CONTENT_ADMIN]: 'Content management, success stories, and platform communications'
  },

  // Default Permissions by Role
  DEFAULT_PERMISSIONS: {
    [constants.ADMIN_ROLES.SUPER_ADMIN]: Object.values(constants.ADMIN_PERMISSIONS),
    [constants.ADMIN_ROLES.SENIOR_ADMIN]: [
      constants.ADMIN_PERMISSIONS.VERIFY_HELPERS,
      constants.ADMIN_PERMISSIONS.VIEW_AUDIT_LOGS,
      constants.ADMIN_PERMISSIONS.MANAGE_SAFETY_INCIDENTS,
      constants.ADMIN_PERMISSIONS.MANAGE_CONTENT,
      constants.ADMIN_PERMISSIONS.VIEW_ANALYTICS,
      constants.ADMIN_PERMISSIONS.EXPORT_DATA
    ],
    [constants.ADMIN_ROLES.VERIFICATION_ADMIN]: [
      constants.ADMIN_PERMISSIONS.VERIFY_HELPERS,
      constants.ADMIN_PERMISSIONS.VIEW_AUDIT_LOGS,
      constants.ADMIN_PERMISSIONS.EXPORT_DATA
    ],
    [constants.ADMIN_ROLES.SAFETY_ADMIN]: [
      constants.ADMIN_PERMISSIONS.MANAGE_SAFETY_INCIDENTS,
      constants.ADMIN_PERMISSIONS.VIEW_AUDIT_LOGS,
      constants.ADMIN_PERMISSIONS.EXPORT_DATA
    ],
    [constants.ADMIN_ROLES.CONTENT_ADMIN]: [
      constants.ADMIN_PERMISSIONS.MANAGE_CONTENT,
      constants.ADMIN_PERMISSIONS.EXPORT_DATA
    ]
  },

  // Admin Actions for Audit Logs
  AUDIT_ACTIONS: {
    LOGIN: 'login',
    LOGOUT: 'logout',
    LOGIN_FAILED: 'login_failed',
    TWO_FA_VERIFIED: '2fa_verified',
    TWO_FA_FAILED: '2fa_failed',
    PASSWORD_RESET: 'password_reset',
    PASSWORD_RESET_REQUEST: 'password_reset_request',
    ADMIN_CREATED: 'admin_created',
    ADMIN_UPDATED: 'admin_updated',
    ADMIN_DELETED: 'admin_deleted',
    ADMIN_INVITE_SENT: 'admin_invite_sent',
    ADMIN_INVITE_ACCEPTED: 'admin_invite_accepted',
    ADMIN_INVITE_CANCELLED: 'admin_invite_cancelled',
    HELPER_VERIFIED: 'helper_verified',
    HELPER_REJECTED: 'helper_rejected',
    SAFETY_INCIDENT_REVIEWED: 'safety_incident_reviewed',
    CRISIS_ESCALATED: 'crisis_escalated',
    SYSTEM_SETTING_CHANGED: 'system_setting_changed',
    DATA_EXPORTED: 'data_exported',
    SESSION_TERMINATED: 'session_terminated',
    ALL_SESSIONS_TERMINATED: 'all_sessions_terminated'
  },

  // Admin Session Status
  SESSION_STATUS: {
    ACTIVE: 'active',
    EXPIRED: 'expired',
    TERMINATED: 'terminated'
  },

  // Admin Invite Status
  INVITE_STATUS: {
    PENDING: 'pending',
    ACCEPTED: 'accepted',
    EXPIRED: 'expired',
    CANCELLED: 'cancelled'
  },

  // Admin Account Status
  ACCOUNT_STATUS: {
    ACTIVE: 'active',
    LOCKED: 'locked',
    SUSPENDED: 'suspended',
    DEACTIVATED: 'deactivated'
  },

  // Maximum failed login attempts before lock
  MAX_FAILED_LOGIN_ATTEMPTS: 5,

  // Account lock duration (30 minutes)
  ACCOUNT_LOCK_DURATION: 30 * 60 * 1000,

  // Session refresh threshold (5 minutes before expiry)
  SESSION_REFRESH_THRESHOLD: 5 * 60 * 1000,

  // Maximum concurrent sessions per admin
  MAX_CONCURRENT_SESSIONS: 3,

  // Audit log retention days
  AUDIT_LOG_RETENTION_DAYS: 90,

  // Export limits
  MAX_EXPORT_RECORDS: 10000
};