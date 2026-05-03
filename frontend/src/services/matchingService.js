import api from './api'

export const matchingService = {
  async acceptCrisis(crisisId) {
    const response = await api.post(`/matching/accept/${crisisId}`)
    return response.data
  },

  async declineCrisis(crisisId, reason = '') {
    const response = await api.post(`/matching/decline/${crisisId}`, { reason })
    return response.data
  },

  async confirmArrival(matchId, latitude, longitude) {
    const response = await api.post(`/matching/arrive/${matchId}`, { latitude, longitude })
    return response.data
  },

  async getActiveMatch() {
    const response = await api.get('/matching/active')
    return response.data
  },

  async cancelMatch(matchId, reason = '') {
    const response = await api.post(`/matching/cancel/${matchId}`, { reason })
    return response.data
  },

  async getMyMatches(page = 1, limit = 20) {
    const response = await api.get('/matching/my-matches', { params: { page, limit } })
    return response.data
  },

  async updateLocation(latitude, longitude) {
    const response = await api.post('/matching/location', { latitude, longitude })
    return response.data
  }
}
