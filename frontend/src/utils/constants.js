export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'
export const APP_NAME = import.meta.env.VITE_APP_NAME || 'Huduma Ecosystem'
export const PILOT_REGION = import.meta.env.VITE_PILOT_REGION || 'Kilifi'
export const EMERGENCY_NUMBERS = (import.meta.env.VITE_EMERGENCY_NUMBERS || '119,999').split(',')

export const USER_ROLES = { SEEKER: 'seeker', HELPER: 'helper', ADMIN: 'admin', GUEST: 'guest' }

export const CRISIS_STATUS = {
  PENDING: 'pending', TRIAGING: 'triaging', MATCHING: 'matching',
  ASSIGNED: 'assigned', IN_PROGRESS: 'in_progress', RESOLVED: 'resolved',
  ESCALATED: 'escalated', CRITICAL: 'critical'
}

export const ACUITY_LEVELS = {
  CRITICAL: { min: 8, max: 10, label: 'Critical', color: '#dc2626' },
  HIGH: { min: 6, max: 7.9, label: 'High', color: '#f97316' },
  MODERATE: { min: 4, max: 5.9, label: 'Moderate', color: '#eab308' },
  LOW: { min: 0, max: 3.9, label: 'Low', color: '#22c55e' }
}

export const HELPER_SPECIALIZATIONS = [
  'psychologist', 'counselor', 'social_worker', 'legal_professional',
  'medical_professional', 'peer_support', 'religious_counselor', 'crisis_specialist'
]

export const COUNTIES = ['Kilifi', 'Mombasa', 'Kwale', 'Lamu', 'Tana River', 'Taita Taveta']
export const KILIFI_SUB_COUNTIES = ['Kilifi North', 'Kilifi South', 'Kaloleni', 'Rabai', 'Ganze', 'Malindi', 'Magarini']
