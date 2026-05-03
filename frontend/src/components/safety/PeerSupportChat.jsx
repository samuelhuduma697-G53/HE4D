import { useState, useEffect, useRef } from 'react'
import { Card } from '../common/Card'
import { Button } from '../common/Button'
import { Input } from '../common/Input'
import { safetyService } from '../../services/safetyService'
import { useSocket } from '../../hooks/useSocket'
import { useAuth } from '../../hooks/useAuth'
import toast from 'react-hot-toast'

export const PeerSupportChat = () => {
  const [requests, setRequests] = useState([])
  const [activeChat, setActiveChat] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [showRequestForm, setShowRequestForm] = useState(false)
  const [requestData, setRequestData] = useState({ supportType: '', urgency: 'normal', description: '' })
  const { socket } = useSocket()
  const { user } = useAuth()
  const messagesEndRef = useRef(null)

  useEffect(() => {
    fetchRequests()
  }, [])

  useEffect(() => {
    if (!socket) return
    socket.on('peer-support-message', (data) => {
      if (data.requestId === activeChat?._id) {
        setMessages(prev => [...prev, data])
      }
    })
    return () => socket.off('peer-support-message')
  }, [socket, activeChat])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const fetchRequests = async () => {
    const data = await safetyService.getPeerSupportRequests()
    setRequests(data.requests || [])
  }

  const createRequest = async (e) => {
    e.preventDefault()
    try {
      await safetyService.requestPeerSupport(requestData)
      toast.success('Support request sent')
      setShowRequestForm(false)
      setRequestData({ supportType: '', urgency: 'normal', description: '' })
      fetchRequests()
    } catch (error) {
      toast.error('Failed to send request')
    }
  }

  const acceptRequest = async (requestId) => {
    try {
      await safetyService.acceptPeerRequest(requestId)
      toast.success('Request accepted')
      fetchRequests()
    } catch (error) {
      toast.error('Failed to accept request')
    }
  }

  const sendMessage = () => {
    if (!input.trim()) return
    socket.emit('peer-support-message', { requestId: activeChat._id, message: input })
    setMessages([...messages, { message: input, senderId: user.id, timestamp: new Date() }])
    setInput('')
  }

  if (activeChat) {
    return (
      <Card className="h-96 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white">Peer Support Chat</h3>
          <Button variant="ghost" size="sm" onClick={() => setActiveChat(null)}>← Back</Button>
        </div>
        
        <div className="flex-1 overflow-y-auto space-y-2 mb-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.senderId === user.id ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] px-3 py-2 rounded-xl ${msg.senderId === user.id ? 'bg-primary-gold text-dark-base' : 'bg-dark-elevated text-white'}`}>
                {msg.message}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="flex gap-2">
          <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type a message..." />
          <Button onClick={sendMessage}>Send</Button>
        </div>
      </Card>
    )
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white">Peer Support</h3>
        <Button size="sm" onClick={() => setShowRequestForm(!showRequestForm)}>
          {showRequestForm ? 'Cancel' : 'Request Support'}
        </Button>
      </div>

      {showRequestForm && (
        <form onSubmit={createRequest} className="mb-6 p-4 glass-card">
          <select value={requestData.supportType} onChange={(e) => setRequestData({ ...requestData, supportType: e.target.value })} className="glass-input mb-3" required>
            <option value="">Select type...</option>
            <option value="emotional">Emotional Support</option>
            <option value="technical">Technical Guidance</option>
            <option value="debriefing">Debriefing</option>
          </select>
          <select value={requestData.urgency} onChange={(e) => setRequestData({ ...requestData, urgency: e.target.value })} className="glass-input mb-3">
            <option value="normal">Normal</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
          <Input value={requestData.description} onChange={(e) => setRequestData({ ...requestData, description: e.target.value })} placeholder="Description..." className="mb-3" />
          <Button type="submit" fullWidth>Send Request</Button>
        </form>
      )}

      <div className="space-y-2 max-h-80 overflow-y-auto">
        {requests.length === 0 ? (
          <p className="text-gray-400 text-center py-4">No active requests</p>
        ) : (
          requests.map(req => (
            <div key={req._id} className="p-3 glass-card">
              <div className="flex items-center justify-between mb-1">
                <span className="text-white">{req.supportType}</span>
                <span className={`text-sm ${req.urgency === 'critical' ? 'text-accent-emergency' : 'text-gray-400'}`}>
                  {req.urgency}
                </span>
              </div>
              <p className="text-gray-400 text-sm mb-2">{req.description}</p>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => acceptRequest(req._id)}>Accept</Button>
                <Button size="sm" variant="ghost" onClick={() => setActiveChat(req)}>Chat</Button>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  )
}
