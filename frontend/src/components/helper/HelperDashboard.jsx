import { useEffect, useState } from 'react'
import { Card } from '../common/Card'
import { Button } from '../common/Button'
import { CrisisQueue } from './CrisisQueue'
import { ActiveCrisis } from './ActiveCrisis'
import { HelperStats } from './HelperStats'
import { VerificationStatus } from './VerificationStatus'
import { helperService } from '../../services/helperService'
import { matchingService } from '../../services/matchingService'
import { useGeolocation } from '../../hooks/useGeolocation'
import toast from 'react-hot-toast'

export const HelperDashboard = () => {
  const [isAvailable, setIsAvailable] = useState(null)
  const [stats, setStats] = useState(null)
  const [verificationStatus, setVerificationStatus] = useState(null)
  const [activeMatch, setActiveMatch] = useState(null)
  const { location, startWatching } = useGeolocation({ watchMode: true })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, verifyRes, matchRes] = await Promise.all([
          helperService.getStats(),
          helperService.getVerificationStatus(),
          matchingService.getActiveMatch().catch(() => ({ activeMatch: null }))
        ])
        setStats(statsRes.stats)
        setVerificationStatus(verifyRes)
        setActiveMatch(matchRes.activeMatch)
        setIsAvailable(statsRes.stats?.isAvailable === true)
      } catch (error) {
        console.error('Failed to fetch helper data:', error)
      }
    }
    fetchData()
    startWatching()
  }, [])

  const toggleAvailability = async () => {
    try {
      await helperService.toggleAvailability(!isAvailable)
      setIsAvailable(!isAvailable)
      toast.success(isAvailable ? 'You are now offline' : 'You are now available for crises')
    } catch (error) {
      toast.error('Failed to update availability')
    }
  }

  const handleCrisisAccepted = (match) => {
    setActiveMatch(match)
  }

  const handleCrisisCompleted = () => {
    setActiveMatch(null)
  }

  if (verificationStatus?.verificationStatus !== 'verified') {
    return <VerificationStatus status={verificationStatus} />
  }

  // Show active crisis if assigned
  if (activeMatch) {
    return (
      <div className="max-w-6xl mx-auto">
        <ActiveCrisis match={activeMatch} onComplete={handleCrisisCompleted} />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white">Helper Dashboard</h1>
        <Button variant={isAvailable ? 'secondary' : 'primary'} onClick={toggleAvailability}>
          {isAvailable === null ? "⏳ Loading..." : isAvailable ? "🔴 Go Offline" : "🟢 Go Online"}
        </Button>
      </div>

      <HelperStats stats={stats} />

      <div className="mt-8">
        <h2 className="text-xl font-bold text-white mb-4">Available Crises</h2>
        <CrisisQueue isAvailable={isAvailable} onAccept={handleCrisisAccepted} />
      </div>
    </div>
  )
}
