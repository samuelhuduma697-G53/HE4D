import { useState, useEffect, useRef } from 'react'
import { Button } from '../common/Button'
import { Input } from '../common/Input'
import { MessageBubble } from './MessageBubble'
import { TypingIndicator } from './TypingIndicator'
import { useSocket } from '../../hooks/useSocket'
import { useAuth } from '../../hooks/useAuth'

export const ChatWindow = ({ crisisId }) => {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const { socket, sendMessage, sendTyping, joinCrisis } = useSocket()
  const { user } = useAuth()
  const messagesEndRef = useRef(null)

  useEffect(() => {
    if (!socket || !crisisId) return

    // Join the crisis room for real-time chat
    joinCrisis(crisisId)

    const handleChatHistory = (data) => setMessages(data.messages || [])
    const handleNewMessage = (data) => setMessages(prev => [...prev, data])
    const handleTyping = (data) => {
      if (data.userId !== user?.id) setIsTyping(data.isTyping)
    }

    socket.on('chat-history', handleChatHistory)
    socket.on('new-message', handleNewMessage)
    socket.on('user-typing', handleTyping)

    return () => {
      socket.off('chat-history', handleChatHistory)
      socket.off('new-message', handleNewMessage)
      socket.off('user-typing', handleTyping)
    }
  }, [socket, crisisId, user?.id, joinCrisis])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = (e) => {
    e.preventDefault()
    if (!input.trim()) return
    sendMessage(crisisId, input)
    setInput('')
  }

  const handleTyping = (e) => {
    setInput(e.target.value)
    sendTyping(crisisId, e.target.value.length > 0)
  }

  const chatLabel = user?.role === 'helper' ? 'Chat with Seeker' : 'Chat with Helper'

  return (
    <div className="glass-card h-96 flex flex-col">
      <div className="p-4 border-b border-white/10">
        <h4 className="text-white font-medium">{chatLabel}</h4>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <p className="text-gray-500 text-center text-sm py-8">
            No messages yet. Start the conversation.
          </p>
        )}
        {messages.map((msg, i) => (
          <MessageBubble key={i} message={msg} isOwn={msg.senderId === user?.id || msg.senderId === user?._id} />
        ))}
        {isTyping && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="p-4 border-t border-white/10 flex gap-2">
        <Input value={input} onChange={handleTyping} placeholder="Type a message..." />
        <Button type="submit" disabled={!input.trim()}>Send</Button>
      </form>
    </div>
  )
}
