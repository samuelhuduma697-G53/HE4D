export const storage = {
  set: (key, value) => {
    try {
      localStorage.setItem(`huduma_${key}`, JSON.stringify(value))
    } catch (e) {
      console.error('Storage set error:', e)
    }
  },
  
  get: (key) => {
    try {
      const item = localStorage.getItem(`huduma_${key}`)
      return item ? JSON.parse(item) : null
    } catch (e) {
      return null
    }
  },
  
  remove: (key) => localStorage.removeItem(`huduma_${key}`),
  
  clearGuest: () => {
    localStorage.removeItem('huduma_guest_token')
    localStorage.removeItem('huduma_guest_data')
  }
}
