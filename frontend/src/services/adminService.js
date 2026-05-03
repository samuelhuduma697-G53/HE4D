import api from './api'

export const adminService = {
  async login(email, password) {
    const response = await api.post('/admin/auth/login', { email, password })
    if (response.data.token) {
      localStorage.setItem('huduma_admin_token', response.data.token)
      localStorage.setItem('huduma_admin', JSON.stringify(response.data.admin))
    }
    return response.data
  },

  async verify2FA(challengeId, code) {
    const response = await api.post('/admin/auth/verify-2fa', { challengeId, code })
    return response.data
  },

  async getDashboard() {
    const response = await api.get('/admin/dashboard')
    return response.data
  },

  async getUsers(params) {
    const response = await api.get('/admin/users', { params })
    return response.data
  },

  async getUserDetails(userId) {
    const response = await api.get(`/admin/users/${userId}`)
    return response.data
  },

  async updateUserStatus(userId, isActive, reason = '') {
    const response = await api.patch(`/admin/users/${userId}/status`, { isActive, reason })
    return response.data
  },

  async verifyHelper(helperId, approve, notes = '') {
    const response = await api.post(`/admin/verify-helper/${helperId}`, { approve, notes })
    return response.data
  },

  async getPendingVerifications() {
    const response = await api.get('/admin/pending-verifications')
    return response.data
  },

  async getAuditLogs(params) {
    const response = await api.get('/admin/audit-logs', { params })
    return response.data
  },

  async getSystemHealth() {
    const response = await api.get('/admin/system-health')
    return response.data
  },

  async createInvite(data) {
    const response = await api.post('/admin/invite/invite', data)
    return response.data
  },

  async getCrisisMonitor() {
    const response = await api.get('/admin/crises/active')
    return response.data
  },

  async getSafetyIncidents(params) {
    const response = await api.get('/safety/admin/incidents', { params })
    return response.data
  },

  async resolveIncident(incidentId, resolution, notes = '') {
    const response = await api.patch(`/safety/admin/incident/${incidentId}/resolve`, { resolution, notes })
    return response.data
  }
}
