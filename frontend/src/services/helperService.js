import api from './api';

export const helperService = {
  async getProfile() {
    const response = await api.get('/helpers/profile');
    return response.data;
  },

  async updateProfile(data) {
    const response = await api.put('/helpers/profile', data);
    return response.data;
  },

  async toggleAvailability(isAvailable, subCounty, ward) {
    const response = await api.patch('/helpers/availability', { isAvailable, subCounty, ward });
    return response.data;
  },

  async getStats() {
    const response = await api.get('/helpers/stats');
    return response.data;
  },

  async getMetrics() {
    const response = await api.get('/helpers/metrics');
    return response.data;
  },

  async uploadDocuments(documentType, documentUrl) {
    const response = await api.post('/helpers/documents', { documentType, documentUrl });
    return response.data;
  },

  async getVerificationStatus() {
    const response = await api.get('/helpers/verification-status');
    return response.data;
  },

  async getNearbyHelpers(lat, lng, radius = 10) {
    const response = await api.get('/helpers/nearby', { params: { lat, lng, radius } });
    return response.data;
  }
};
