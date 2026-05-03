import api from './api'

export const publicService = {
  async getStats() {
    const response = await api.get('/public/stats')
    return response.data
  },
  
  async getSuccessStories(page = 1, limit = 10) {
    const response = await api.get('/public/success-stories', {
      params: { page, limit }
    })
    return response.data
  },
  
  async getEmergencyContacts() {
    return {
      police: '119',
      ambulance: '999',
      gbv: '1195',
      childline: '116'
    }
  }
}

export default publicService
