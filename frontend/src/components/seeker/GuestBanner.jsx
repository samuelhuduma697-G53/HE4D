import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { Card } from '../common/Card'
import { Button } from '../common/Button'

export const GuestBanner = () => {
  const { isGuest } = useAuth()
  const navigate = useNavigate()

  if (!isGuest) return null

  return (
    <Card className="mb-6 border-primary-gold/30 bg-primary-gold/5">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <p className="text-primary-gold font-semibold">⚡ Guest Session Active</p>
          <p className="text-gray-400 text-sm mt-1">
            You have one free crisis submission. Register to unlock unlimited access, crisis history, and real-time helper tracking.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" size="sm" onClick={() => navigate('/register')}>
            Register Now
          </Button>
          <Button size="sm" onClick={() => navigate('/login')}>
            Login
          </Button>
        </div>
      </div>
    </Card>
  )
}

export default GuestBanner
