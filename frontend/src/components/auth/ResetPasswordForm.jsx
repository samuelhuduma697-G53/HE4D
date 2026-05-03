import { useState } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { Input } from '../common/Input'
import { Button } from '../common/Button'
import { authService } from '../../services/authService'
import toast from 'react-hot-toast'

export const ResetPasswordForm = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (password.length < 8) return toast.error('Password must be at least 8 characters')
    if (password !== confirm) return toast.error('Passwords do not match')

    setLoading(true)
    try {
      await authService.resetPassword(token, password)
      setDone(true)
      toast.success('Password reset successfully!')
    } catch {
      toast.error('Reset failed. Token may be expired.')
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="glass-card p-8 max-w-md w-full text-center">
          <p className="text-red-400 mb-4">Invalid reset link. No token provided.</p>
          <Link to="/forgot-password" className="text-primary-gold hover:underline">Request a new reset link</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass-card p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold text-white mb-2">Reset Password</h2>
        <p className="text-gray-400 mb-6">Enter your new password.</p>

        {done ? (
          <div className="text-center">
            <p className="text-green-400 mb-4">✅ Password reset successfully!</p>
            <Link to="/login" className="text-primary-gold hover:underline">Go to Login</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <Input label="New Password" name="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 8 characters" />
            <div className="mt-4">
              <Input label="Confirm Password" name="confirm" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Re-enter password" />
            </div>
            <Button type="submit" fullWidth isLoading={loading} className="mt-6">Reset Password</Button>
          </form>
        )}
      </div>
    </div>
  )
}
