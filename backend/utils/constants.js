/**
 * Application Constants
 * Centralized configuration for the entire application
 */

module.exports = {
  // User Roles
  USER_ROLES: {
    SEEKER: 'seeker',
    HELPER: 'helper',
    ADMIN: 'admin'
  },

  // Admin Roles Hierarchy
  ADMIN_ROLES: {
    SUPER_ADMIN: 'super_admin',
    SENIOR_ADMIN: 'senior_admin',
    VERIFICATION_ADMIN: 'verification_admin',
    SAFETY_ADMIN: 'safety_admin',
    CONTENT_ADMIN: 'content_admin'
  },

  // Admin Permissions
  ADMIN_PERMISSIONS: {
    MANAGE_ADMINS: 'manage_admins',
    VERIFY_HELPERS: 'verify_helpers',
    VIEW_AUDIT_LOGS: 'view_audit_logs',
    MANAGE_SAFETY_INCIDENTS: 'manage_safety_incidents',
    MANAGE_CONTENT: 'manage_content',
    VIEW_ANALYTICS: 'view_analytics',
    MANAGE_SYSTEM_SETTINGS: 'manage_system_settings',
    EXPORT_DATA: 'export_data'
  },

  // Crisis Status
  CRISIS_STATUS: {
    PENDING: 'pending',
    TRIAGING: 'triaging',
    MATCHING: 'matching',
    ASSIGNED: 'assigned',
    IN_PROGRESS: 'in_progress',
    RESOLVED: 'resolved',
    ESCALATED: 'escalated',
    EXPIRED: 'expired',
    CRITICAL: 'critical'
  },

  // Acuity Levels
  ACUITY_LEVELS: {
    CRITICAL: { min: 8, max: 10, label: 'Critical', color: '#dc2626', priority: 1 },
    HIGH: { min: 6, max: 7.9, label: 'High', color: '#f97316', priority: 2 },
    MODERATE: { min: 4, max: 5.9, label: 'Moderate', color: '#eab308', priority: 3 },
    LOW: { min: 0, max: 3.9, label: 'Low', color: '#22c55e', priority: 4 }
  },

  // Helper Status
  HELPER_STATUS: {
    PENDING_VERIFICATION: 'pending_verification',
    VERIFIED: 'verified',
    ACTIVE: 'active',
    BUSY: 'busy',
    OFFLINE: 'offline',
    SUSPENDED: 'suspended',
    REJECTED: 'rejected'
  },

  // Match Status
  MATCH_STATUS: {
    PENDING: 'pending',
    ACCEPTED: 'accepted',
    DECLINED: 'declined',
    EXPIRED: 'expired',
    COMPLETED: 'completed'
  },

  // Notification Types
  NOTIFICATION_TYPES: {
    CRISIS_ASSIGNED: 'crisis_assigned',
    CRISIS_UPDATED: 'crisis_updated',
    HELPER_ACCEPTED: 'helper_accepted',
    HELPER_ARRIVED: 'helper_arrived',
    CRISIS_RESOLVED: 'crisis_resolved',
    SAFETY_ALERT: 'safety_alert',
    VERIFICATION_STATUS: 'verification_status',
    SYSTEM_ALERT: 'system_alert',
    NEW_MESSAGE: 'new_message',
    PANIC_ALERT: 'panic_alert'
  },

  // Safety Incident Types
  SAFETY_INCIDENT_TYPES: {
    PHYSICAL_HARM: 'physical_harm',
    VERBAL_ABUSE: 'verbal_abuse',
    THREAT: 'threat',
    UNSAFE_LOCATION: 'unsafe_location',
    MEDICAL_EMERGENCY: 'medical_emergency',
    HARASSMENT: 'harassment',
    ACCIDENT: 'accident',
    OTHER: 'other'
  },

  // Safety Incident Severity
  SAFETY_SEVERITY: {
    CRITICAL: 'critical',
    HIGH: 'high',
    MODERATE: 'moderate',
    LOW: 'low'
  },

  // Crisis Categories
  CRISIS_CATEGORIES: {
    MENTAL_HEALTH: 'mental_health',
    DOMESTIC_VIOLENCE: 'domestic_violence',
    LEGAL: 'legal',
    MEDICAL: 'medical',
    FINANCIAL: 'financial',
    HOUSING: 'housing',
    SUBSTANCE_ABUSE: 'substance_abuse',
    SUICIDE_RISK: 'suicide_risk',
    TRAUMA: 'trauma',
    EMERGENCY: 'emergency',
    OTHER: 'other'
  },

  // Helper Specializations
  HELPER_SPECIALIZATIONS: {
    PSYCHOLOGIST: 'psychologist',
    COUNSELOR: 'counselor',
    SOCIAL_WORKER: 'social_worker',
    LEGAL_PROFESSIONAL: 'legal_professional',
    MEDICAL_PROFESSIONAL: 'medical_professional',
    PEER_SUPPORT: 'peer_support',
    RELIGIOUS_COUNSELOR: 'religious_counselor',
    CRISIS_SPECIALIST: 'crisis_specialist'
  },

  // Languages
  LANGUAGES: {
    ENGLISH: 'english',
    SWAHILI: 'swahili',
    SHENG: 'sheng'
  },

  // Database Collection Names
  COLLECTIONS: {
    USERS: 'users',
    CRISES: 'crises',
    MATCHES: 'matches',
    TRANSACTIONS: 'transactions',
    NOTIFICATIONS: 'notifications',
    FEEDBACK: 'feedbacks',
    ADMINS: 'admins',
    ADMIN_INVITES: 'admin_invites',
    ADMIN_SESSIONS: 'admin_sessions',
    ADMIN_AUDIT_LOGS: 'admin_audit_logs',
    ADMIN_2FA: 'admin_2fas',
    SAFETY_REPORTS: 'safety_reports',
    PEER_SUPPORTS: 'peer_supports',
    DEBRIEFINGS: 'debriefings',
    ESCORT_SESSIONS: 'escort_sessions'
  },

  // Rate Limits
  RATE_LIMITS: {
    PUBLIC_API: { windowMs: 60 * 1000, max: 100 },
    AUTH_API: { windowMs: 15 * 60 * 1000, max: 5 },
    ADMIN_API: { windowMs: 60 * 1000, max: 100 },
    ADMIN_AUTH: { windowMs: 15 * 60 * 1000, max: 5 },
    CRISIS_API: { windowMs: 10 * 60 * 1000, max: 3 }
  },

  // Session Settings
  SESSION: {
    ADMIN_TOKEN_EXPIRY: '15m',
    USER_TOKEN_EXPIRY: '7d',
    REFRESH_TOKEN_EXPIRY: '30d',
    ADMIN_SESSION_TIMEOUT: 15 * 60 * 1000,
    USER_SESSION_TIMEOUT: 7 * 24 * 60 * 60 * 1000
  },

  // 2FA Settings
  TWO_FA: {
    CODE_LENGTH: 6,
    CODE_EXPIRY: 5 * 60 * 1000,
    BACKUP_CODE_COUNT: 10
  },

  // Invitation Settings
  INVITE: {
    EXPIRY_DAYS: 7,
    TOKEN_LENGTH: 32
  },

  // Password Requirements
  PASSWORD: {
    MIN_LENGTH: 8,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBER: true,
    REQUIRE_SPECIAL: true
  },

  // Geospatial Settings
  GEOSPATIAL: {
    DEFAULT_MAX_DISTANCE_KM: 20,
    EARTH_RADIUS_KM: 6371,
    ARRIVAL_THRESHOLD_METERS: 100
  },

  // Matching Algorithm Weights
  MATCHING_WEIGHTS: {
    ACUITY: 0.4,
    DISTANCE: 0.3,
    SPECIALIZATION: 0.2,
    AVAILABILITY: 0.1,
    TRUST_SCORE: 0.2
  },

  // Payment Types
  PAYMENT_TYPES: {
    DONATION: 'donation',
    EXPENSE: 'expense',
    HELPER_PAYMENT: 'helper_payment',
    REFUND: 'refund'
  },

  // Payment Status
  PAYMENT_STATUS: {
    PENDING: 'pending',
    COMPLETED: 'completed',
    FAILED: 'failed',
    REFUNDED: 'refunded',
    CANCELLED: 'cancelled'
  },

  // Escort Mode Status
  ESCORT_STATUS: {
    ACTIVE: 'active',
    PAUSED: 'paused',
    COMPLETED: 'completed',
    ESCALATED: 'escalated',
    EMERGENCY: 'emergency'
  },

  // Cache TTLs (seconds)
  CACHE_TTL: {
    GEOCODING: 86400,
    ROUTE: 3600,
    USER_PROFILE: 3600,
    CRISIS_LIST: 300,
    STATS: 300
  }
};