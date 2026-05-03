import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('huduma_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only try refresh if we have a token AND got 401
    const token = localStorage.getItem('huduma_token')
    if (error.response?.status === 401 && token && !error.config._retry) {
      error.config._retry = true
      const role = localStorage.getItem('huduma_role')
      
      if (role !== 'admin') {
        return axios.post(`${API_URL}/auth/refresh`)
          .then(res => {
            localStorage.setItem('huduma_token', res.data.token)
            error.config.headers.Authorization = `Bearer ${res.data.token}`
            return api(error.config)
          })
          .catch(() => {
            localStorage.clear()
            return Promise.reject(error)
          })
      }
    }
    
    // Don't trigger refresh loop - just reject
    return Promise.reject(error)
  }
)

export default api
