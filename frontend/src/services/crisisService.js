import api from './api'

export const crisisService = {
  async submitCrisis(data) {
    const response = await api.post('/crisis/submit', data)
    return response.data
  },

  async submitGuestCrisis(data) {
    const response = await api.post('/crisis/guest/submit', data)
    return response.data
  },

  async triggerPanic(latitude, longitude, text = 'PANIC BUTTON ACTIVATED') {
    const response = await api.post('/crisis/panic', { latitude, longitude, text })
    return response.data
  },

  async getQueue() {
    const response = await api.get('/crisis/queue')
    return response.data
  },

  async getCrisis(crisisId) {
    const response = await api.get(`/crisis/${crisisId}`)
    return response.data
  },

  async updateStatus(crisisId, status, notes = '') {
    const response = await api.patch(`/crisis/${crisisId}/status`, { status, notes })
    return response.data
  },

  async getHistory(page = 1, limit = 20) {
    const response = await api.get('/crisis/history/mine', { params: { page, limit } })
    return response.data
  },

  async getStats() {
    const response = await api.get('/crisis/stats/summary')
    return response.data
  }
}
