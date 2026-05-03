module.exports = {
  USER_ROLES: {
    SEEKER: 'seeker',
    HELPER: 'helper',
    ADMIN: 'admin'
  },

  ADMIN_ROLES: {
    SUPER_ADMIN: 'super_admin',
    SENIOR_ADMIN: 'senior_admin',
    VERIFICATION_ADMIN: 'verification_admin',
    SAFETY_ADMIN: 'safety_admin',
    CONTENT_ADMIN: 'content_admin'
  },

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

  MATCH_STATUS: {
    PENDING: 'pending',
    ACCEPTED: 'accepted',
    DECLINED: 'declined',
    EXPIRED: 'expired',
    COMPLETED: 'completed'
  },

  NOTIFICATION_TYPES: {
    CRISIS_ASSIGNED: 'crisis_assigned',
    HELPER_ACCEPTED: 'helper_accepted',
    STATUS_UPDATE: 'status_update',
    SAFETY_ALERT: 'safety_alert',
    PANIC_ALERT: 'panic_alert',
    EMERGENCY: 'emergency'
  },

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

  SAFETY_SEVERITY: {
    CRITICAL: 'critical',
    HIGH: 'high',
    MODERATE: 'moderate',
    LOW: 'low'
  },

  GEOSPATIAL: {
    DEFAULT_MAX_DISTANCE_KM: 20,
    EARTH_RADIUS_KM: 6371,
    ARRIVAL_THRESHOLD_METERS: 100
  },

  MATCHING_WEIGHTS: {
    ACUITY: 0.4,
    DISTANCE: 0.3,
    SPECIALIZATION: 0.2,
    AVAILABILITY: 0.1,
    TRUST_SCORE: 0.2
  },

  PAYMENT_TYPES: {
    DONATION: 'donation',
    EXPENSE: 'expense',
    HELPER_PAYMENT: 'helper_payment',
    REFUND: 'refund'
  },

  PAYMENT_STATUS: {
    PENDING: 'pending',
    COMPLETED: 'completed',
    FAILED: 'failed',
    REFUNDED: 'refunded',
    CANCELLED: 'cancelled'
  },

  SESSION: {
    ADMIN_TOKEN_EXPIRY: '15m',
    USER_TOKEN_EXPIRY: '24h',
    REFRESH_TOKEN_EXPIRY: '30d',
    ADMIN_SESSION_TIMEOUT: 15 * 60 * 1000
  },

  TWO_FA: {
    CODE_LENGTH: 6,
    CODE_EXPIRY: 5 * 60 * 1000,
    BACKUP_CODE_COUNT: 10
  },

  INVITE: {
    EXPIRY_DAYS: 7,
    TOKEN_LENGTH: 32
  },

  PASSWORD: {
    MIN_LENGTH: 8,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBER: true,
    REQUIRE_SPECIAL: true
  },

  RATE_LIMITS: {
    PUBLIC_API: { windowMs: 60 * 1000, max: 100 },
    AUTH_API: { windowMs: 15 * 60 * 1000, max: 5 },
    ADMIN_API: { windowMs: 60 * 1000, max: 100 },
    ADMIN_AUTH: { windowMs: 15 * 60 * 1000, max: 5 },
    CRISIS_API: { windowMs: 10 * 60 * 1000, max: 3 }
  },

  CACHE_TTL: {
    GEOCODING: 86400,
    ROUTE: 3600,
    USER_PROFILE: 3600,
    CRISIS_LIST: 300,
    STATS: 300
  },
  // Add to existing constants

  GUEST_SESSION: {
   MAX_CRISES: 1,
   EXPIRY_HOURS: 2,
   MAX_SESSIONS_PER_DEVICE: 1,
   MAX_SESSIONS_PER_IP_PER_DAY: 5
  }
};