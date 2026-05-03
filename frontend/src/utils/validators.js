export const validators = {
  isEmail: (email) => /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/.test(email),
  
  isKenyanPhone: (phone) => /^\+254(7|1)[0-9]{8}$/.test(phone),
  
  isKenyanNationalId: (id) => /^[0-9]{7,8}$/.test(String(id)),
  
  isStrongPassword: (password) => {
    if (password.length < 8) return false
    return /[A-Z]/.test(password) && /[a-z]/.test(password) && /[0-9]/.test(password) && /[!@#$%^&*]/.test(password)
  },
  
  isName: (name) => name && name.trim().length >= 2 && name.trim().length <= 50 && /^[a-zA-Z\s'\-]+$/.test(name.trim()),
  
  isValidYears: (years) => !isNaN(years) && years >= 0 && years <= 50,
  
  isServiceCounty: (county) => ['Kilifi', 'Mombasa', 'Kwale', 'Lamu', 'Tana River', 'Taita Taveta'].includes(county)
}
