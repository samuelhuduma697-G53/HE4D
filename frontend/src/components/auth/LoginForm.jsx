import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useForm } from '../../hooks/useForm'
import { Input } from '../common/Input'
import { Button } from '../common/Button'
import { validators } from '../../utils/validators'

export const LoginForm = () => {
  const { login, adminLogin, startGuestSession } = useAuth()
  const navigate = useNavigate()
  const [isGuest, setIsGuest] = useState(false)

  const { values, errors, handleChange, handleBlur, validateAll, isSubmitting, setIsSubmitting } = useForm(
    { emailOrPhone: '', password: '' },
    { emailOrPhone: (v) => !v ? 'Email or phone required' : '', password: (v) => !v ? 'Password required' : '' }
  )

  const guestForm = useForm(
    { name: '', phone: '' },
    { name: (v) => !v ? 'Name required' : '', phone: (v) => !validators.isKenyanPhone(v) ? 'Valid Kenyan phone required (+254...)' : '' }
  )

  const redirectByRole = (user) => {
    const role = user?.role
    if (role === 'helper') navigate('/dashboard/helper')
    else if (role === 'admin' || role === 'super_admin' || role === 'senior_admin') navigate('/dashboard/admin')
    else navigate('/dashboard/seeker')
  }

  const doLogin = async (e) => {
    e.preventDefault()
    if (isSubmitting) return
    if (!values.emailOrPhone || !values.password) return
    if (!validateAll()) return
    setIsSubmitting(true)
    try {
      const isEmail = values.emailOrPhone.includes('@')
      let response
      if (isEmail) {
        try { response = await adminLogin(values.emailOrPhone, values.password) }
        catch { response = await login(values.emailOrPhone, values.password) }
      } else {
        response = await login(values.emailOrPhone, values.password)
      }
      redirectByRole(response.user || response.admin)
    } catch {} finally { setIsSubmitting(false) }
  }

  const doGuest = async (e) => {
    e.preventDefault()
    if (guestForm.isSubmitting) return
    if (!guestForm.values.name || !guestForm.values.phone) return
    if (!guestForm.validateAll()) return
    guestForm.setIsSubmitting(true)
    try {
      const response = await startGuestSession(guestForm.values.name, guestForm.values.phone)
      redirectByRole(response.user)
    } catch {} finally { guestForm.setIsSubmitting(false) }
  }

  return (
    <div>
      <div className="flex gap-2 mb-6">
        <button onClick={() => setIsGuest(false)} className={`flex-1 py-2 rounded-lg ${!isGuest ? 'bg-primary-gold text-dark-base' : 'text-gray-400'}`}>Sign In</button>
        <button onClick={() => setIsGuest(true)} className={`flex-1 py-2 rounded-lg ${isGuest ? 'bg-primary-gold text-dark-base' : 'text-gray-400'}`}>Try First</button>
      </div>
      {!isGuest ? (
        <form onSubmit={doLogin}>
          <Input label="Email or Phone" name="emailOrPhone" value={values.emailOrPhone} onChange={handleChange} onBlur={handleBlur} error={errors.emailOrPhone} placeholder="email@example.com or +254..." />
          <div className="mt-4"><Input label="Password" name="password" type="password" value={values.password} onChange={handleChange} onBlur={handleBlur} error={errors.password} placeholder="••••••••" /></div>
          <div className="text-right mt-2"><Link to="/forgot-password" className="text-sm text-primary-gold hover:underline">Forgot Password?</Link></div>
          <Button type="submit" fullWidth isLoading={isSubmitting} className="mt-6">Sign In</Button>
          <p className="text-center text-gray-400 mt-6">Don't have an account? <Link to="/register" className="text-primary-gold hover:underline">Sign Up</Link></p>
        </form>
      ) : (
        <form onSubmit={doGuest}>
          <p className="text-sm text-gray-400 mb-4">Try one free crisis session without registration.</p>
          <Input label="Your Name" name="name" value={guestForm.values.name} onChange={guestForm.handleChange} onBlur={guestForm.handleBlur} error={guestForm.errors.name} placeholder="John Doe" />
          <div className="mt-4"><Input label="Phone Number" name="phone" value={guestForm.values.phone} onChange={guestForm.handleChange} onBlur={guestForm.handleBlur} error={guestForm.errors.phone} placeholder="+254700000000" /></div>
          <Button type="submit" fullWidth isLoading={guestForm.isSubmitting} className="mt-6">Start Guest Session</Button>
        </form>
      )}
    </div>
  )
}
