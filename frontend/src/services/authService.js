import api from './api'

export const authService = {
  async login(emailOrPhone, password) {
    const response = await api.post('/auth/login', { emailOrPhone, password })
    if (response.data.token) {
      localStorage.setItem('huduma_token', response.data.token)
      localStorage.setItem('huduma_user', JSON.stringify(response.data.user))
      localStorage.setItem('huduma_role', response.data.user?.role || 'seeker')
    }
    return response.data
  },

  async adminLogin(email, password) {
    const response = await api.post('/admin/auth/login', { email, password })
    if (response.data.token) {
      localStorage.setItem('huduma_token', response.data.token)
      localStorage.setItem('huduma_user', JSON.stringify(response.data.admin))
      localStorage.setItem('huduma_role', 'admin')
    }
    return response.data
  },

  async registerSeeker(data) {
    const response = await api.post('/auth/register/seeker', data)
    if (response.data.token) {
      localStorage.setItem('huduma_token', response.data.token)
      localStorage.setItem('huduma_user', JSON.stringify(response.data.user))
      localStorage.setItem('huduma_role', 'seeker')
    }
    return response.data
  },

  async registerHelper(data) {
    const response = await api.post('/auth/register/helper', data)
    return response.data
  },

  async guestSession(name, phone) {
    const response = await api.post('/auth/guest-session', { name, phone })
    if (response.data.token) {
      localStorage.setItem('huduma_guest_token', response.data.token)
      localStorage.setItem('huduma_guest_data', JSON.stringify(response.data.user))
    }
    return response.data
  },

  async getMe() {
    const response = await api.get('/auth/me')
    return response.data
  },

  async logout() {
    const role = localStorage.getItem('huduma_role')
    try {
      // Only call logout endpoint for regular users
      if (role !== 'admin') {
        await api.post('/auth/logout')
      } else {
        await api.post('/admin/auth/logout')
      }
    } finally {
      localStorage.removeItem('huduma_token')
      localStorage.removeItem('huduma_refresh_token')
      localStorage.removeItem('huduma_user')
      localStorage.removeItem('huduma_guest_token')
      localStorage.removeItem('huduma_guest_data')
      localStorage.removeItem('huduma_role')
    }
  },

  async forgotPassword(email) {
    return api.post('/auth/forgot-password', { email })
  },

  async resetPassword(token, newPassword) {
    return api.post('/auth/reset-password', { token, newPassword })
  }
}
