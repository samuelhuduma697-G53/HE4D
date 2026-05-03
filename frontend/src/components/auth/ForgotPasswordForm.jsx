import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Input } from '../common/Input'
import { Button } from '../common/Button'
import { authService } from '../../services/authService'
import toast from 'react-hot-toast'

export const ForgotPasswordForm = () => {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email) return toast.error('Please enter your email')
    
    setLoading(true)
    try {
      await authService.forgotPassword(email)
      setSent(true)
      toast.success('If an account exists, a reset link has been sent')
    } catch {
      toast.error('Failed to send reset email')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass-card p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold text-white mb-2">Forgot Password</h2>
        <p className="text-gray-400 mb-6">Enter your email to receive a reset link.</p>

        {sent ? (
          <div className="text-center">
            <p className="text-green-400 mb-4">✅ Reset link sent! Check your email.</p>
            <Link to="/login" className="text-primary-gold hover:underline">Back to Login</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <Input
              label="Email Address"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
            />
            <Button type="submit" fullWidth isLoading={loading} className="mt-6">
              Send Reset Link
            </Button>
            <p className="text-center text-gray-400 mt-4">
              <Link to="/login" className="text-primary-gold hover:underline">Back to Login</Link>
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
