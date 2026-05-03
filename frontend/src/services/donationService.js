import api from './api'

export const donationService = {
  async getGoals() {
    const response = await api.get('/donations/goals')
    return response.data
  },
  
  async initiateMpesa(amount, phoneNumber) {
    const response = await api.post('/donations/mpesa/stk-push', { 
      amount, 
      phoneNumber 
    })
    return response.data
  },
  
  async getLedger(page = 1, limit = 50) {
    const response = await api.get('/donations/ledger', { 
      params: { page, limit } 
    })
    return response.data
  },
  
  async getStats() {
    const response = await api.get('/donations/stats')
    return response.data
  }
}

export default donationService
