import { useState, useEffect } from 'react'
import { Card } from '../common/Card'
import { Button } from '../common/Button'
import { Input } from '../common/Input'
import { safetyService } from '../../services/safetyService'
import { useGeolocation } from '../../hooks/useGeolocation'
import toast from 'react-hot-toast'

export const EscortMode = ({ crisisId, matchId }) => {
  const [isActive, setIsActive] = useState(false)
  const [sessionId, setSessionId] = useState(null)
  const [contacts, setContacts] = useState([{ name: '', phone: '', relationship: '' }])
  const [checkInInterval, setCheckInInterval] = useState(10)
  const [nextCheckIn, setNextCheckIn] = useState(null)
  const { location } = useGeolocation({ watchMode: isActive })

  useEffect(() => {
    safetyService.getActiveEscort().then(res => {
      if (res.active) {
        setIsActive(true)
        setSessionId(res.session.id)
        setNextCheckIn(res.session.nextCheckInAt)
      }
    })
  }, [])

  const activateEscort = async () => {
    try {
      const res = await safetyService.activateEscort({
        crisisId,
        matchId,
        contacts: contacts.filter(c => c.name && c.phone),
        checkInInterval
      })
      setIsActive(true)
      setSessionId(res.sessionId)
      toast.success('Escort mode activated')
    } catch (error) {
      toast.error('Failed to activate escort mode')
    }
  }

  const handleCheckIn = async () => {
    try {
      const res = await safetyService.checkIn(sessionId, 'safe', location?.latitude, location?.longitude)
      setNextCheckIn(res.nextCheckIn)
      toast.success('Check-in recorded')
    } catch (error) {
      toast.error('Check-in failed')
    }
  }

  const handleEmergency = async () => {
    try {
      await safetyService.emergencyAlert(sessionId, 'Manual emergency trigger', location?.latitude, location?.longitude)
      toast.error('Emergency alert sent!')
    } catch (error) {
      toast.error('Failed to send emergency alert')
    }
  }

  const completeEscort = async () => {
    try {
      await safetyService.completeEscort(sessionId)
      setIsActive(false)
      setSessionId(null)
      toast.success('Escort mode completed')
    } catch (error) {
      toast.error('Failed to complete escort')
    }
  }

  if (isActive) {
    return (
      <Card className="border-accent-emergency/30">
        <h3 className="text-xl font-bold text-accent-emergency mb-4">🚨 Escort Mode Active</h3>
        
        <div className="space-y-4">
          <div className="glass-card p-4 text-center">
            <p className="text-gray-400">Next Check-in</p>
            <p className="text-2xl font-bold text-white">
              {nextCheckIn ? new Date(nextCheckIn).toLocaleTimeString() : 'Calculating...'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button onClick={handleCheckIn}>✅ Check In</Button>
            <Button variant="danger" onClick={handleEmergency}>🆘 Emergency</Button>
          </div>

          <Button variant="secondary" fullWidth onClick={completeEscort}>
            End Escort Session
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <Card>
      <h3 className="text-xl font-bold text-white mb-4">🛡️ Activate Escort Mode</h3>
      <p className="text-gray-400 mb-4">
        Share your location with emergency contacts during this crisis response.
      </p>

      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-300 mb-2">Check-in Interval (minutes)</label>
          <select value={checkInInterval} onChange={(e) => setCheckInInterval(parseInt(e.target.value))} className="glass-input">
            <option value={5}>5 minutes</option>
            <option value={10}>10 minutes</option>
            <option value={15}>15 minutes</option>
          </select>
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-2">Emergency Contacts</label>
          {contacts.map((contact, i) => (
            <div key={i} className="grid grid-cols-3 gap-2 mb-2">
              <Input placeholder="Name" value={contact.name} onChange={(e) => {
                const newContacts = [...contacts]
                newContacts[i].name = e.target.value
                setContacts(newContacts)
              }} />
              <Input placeholder="Phone" value={contact.phone} onChange={(e) => {
                const newContacts = [...contacts]
                newContacts[i].phone = e.target.value
                setContacts(newContacts)
              }} />
              <Input placeholder="Relation" value={contact.relationship} onChange={(e) => {
                const newContacts = [...contacts]
                newContacts[i].relationship = e.target.value
                setContacts(newContacts)
              }} />
            </div>
          ))}
          <button onClick={() => setContacts([...contacts, { name: '', phone: '', relationship: '' }])} className="text-primary-gold text-sm">
            + Add Contact
          </button>
        </div>

        <Button onClick={activateEscort} fullWidth>
          Activate Escort Mode
        </Button>
      </div>
    </Card>
  )
}
