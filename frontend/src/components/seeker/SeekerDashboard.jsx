import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Link } from 'react-router-dom'
import { Card } from '../common/Card'
import { Button } from '../common/Button'
import { CrisisSubmission } from './CrisisSubmission'
import { ActiveCrisisCard } from './ActiveCrisisCard'
import { CrisisHistory } from './CrisisHistory'

import { useAuth } from '../../hooks/useAuth'
import { matchingService } from '../../services/matchingService'
import { crisisService } from '../../services/crisisService'
import { useSocket } from '../../hooks/useSocket'
import toast from 'react-hot-toast'

export const SeekerDashboard = () => {
  const [showSubmission, setShowSubmission] = useState(false)
  const [activeCrisis, setActiveCrisis] = useState(null)
  const { isGuest } = useAuth()
  const { socket } = useSocket()
  const navigate = useNavigate()

  // Check for active crisis/matches on load
  useEffect(() => {
    const checkActive = async () => {
      try {
        const matchRes = await matchingService.getActiveMatch().catch(() => ({ activeMatch: null }))
        if (matchRes.activeMatch) {
          const crisis = await crisisService.getCrisis(matchRes.activeMatch.crisisId?._id || matchRes.activeMatch.crisisId)
          setActiveCrisis(crisis.crisis)
        }
      } catch {}
    }
    checkActive()
  }, [])

  // Listen for helper acceptance via socket
  useEffect(() => {
    if (!socket) return
    socket.on('crisis-accepted', async (data) => {
      try {
        const crisis = await crisisService.getCrisis(data.crisisId)
        setActiveCrisis(crisis.crisis)
        toast.success(`${data.helperName || 'A helper'} has accepted your crisis! ETA: ${data.eta || '?'} min`)
      } catch {}
    })
    return () => socket.off('crisis-accepted')
  }, [socket])

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white">Seeker Dashboard</h1>
        {!activeCrisis && (
          <Button onClick={() => setShowSubmission(!showSubmission)}>
            {showSubmission ? 'Cancel' : 'Report New Crisis'}
          </Button>
        )}
      </div>

      {isGuest && (
        <Card className="mb-6 border-primary-gold/30 bg-primary-gold/5">
          <p className="text-primary-gold">
            ⚡ Guest Session Active — You have one free crisis submission. 
            <Link to="/register" className="underline ml-2">Register to unlock full access</Link>
          </p>
        </Card>
      )}

      {showSubmission && !activeCrisis && (
        <Card className="mb-8">
          <CrisisSubmission onSuccess={(crisis) => { setActiveCrisis(crisis); setShowSubmission(false); }} />
        </Card>
      )}

      {activeCrisis ? (
        <ActiveCrisisCard crisis={activeCrisis} />
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <h3 className="text-xl font-bold text-white mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Button fullWidth onClick={() => setShowSubmission(true)}>Report Crisis</Button>
              <Button variant="secondary" fullWidth onClick={() => navigate("/resources")}>View Resources</Button>
            </div>
          </Card>
          <Card>
            <h3 className="text-xl font-bold text-white mb-4">Emergency Contacts</h3>
            <div className="space-y-2">
              <p><span className="text-gray-400">Police:</span> <span className="text-white font-bold">119</span></p>
              <p><span className="text-gray-400">Ambulance:</span> <span className="text-white font-bold">999</span></p>
              <p><span className="text-gray-400">GBV Hotline:</span> <span className="text-white font-bold">1195</span></p>
            </div>
          </Card>
        </div>
      )}

      <div className="mt-8">
        <CrisisHistory />
      </div>
    </div>
  )
}
