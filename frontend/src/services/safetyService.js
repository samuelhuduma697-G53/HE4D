import api from './api'

export const safetyService = {
  async reportIncident(data) {
    const response = await api.post('/safety/report', data)
    return response.data
  },

  async getSafetyBriefing(crisisId) {
    const response = await api.get(`/safety/briefing/${crisisId}`)
    return response.data
  },

  async activateEscort(data) {
    const response = await api.post('/escort/activate', data)
    return response.data
  },

  async checkIn(sessionId, status = 'safe', latitude, longitude) {
    const response = await api.post('/escort/checkin', { sessionId, status, latitude, longitude })
    return response.data
  },

  async emergencyAlert(sessionId, notes = '', latitude, longitude) {
    const response = await api.post('/escort/emergency', { sessionId, notes, latitude, longitude })
    return response.data
  },

  async completeEscort(sessionId) {
    const response = await api.post('/escort/complete', { sessionId })
    return response.data
  },

  async getActiveEscort() {
    const response = await api.get('/escort/active')
    return response.data
  },

  async createDebriefing(data) {
    const response = await api.post('/debriefing', data)
    return response.data
  },

  async getMyDebriefings() {
    const response = await api.get('/debriefing/my')
    return response.data
  },

  async requestPeerSupport(data) {
    const response = await api.post('/peer-support/request', data)
    return response.data
  },

  async getPeerSupportRequests() {
    const response = await api.get('/peer-support/my-requests')
    return response.data
  },

  async getRiskZones(lat, lng, radius = 5) {
    const response = await api.get('/safety/risk-zones', { params: { lat, lng, radius } })
    return response.data
  }
}
