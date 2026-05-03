import { useRef, useState, useCallback } from 'react'
import { useSocket } from './useSocket'

export const useWebRTC = (crisisId) => {
  const [isCallActive, setIsCallActive] = useState(false)
  const [isIncoming, setIsIncoming] = useState(false)
  const [callerName, setCallerName] = useState('')
  const peerRef = useRef(null)
  const localStreamRef = useRef(null)
  const { socket } = useSocket()

  const servers = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] }

  const startCall = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false })
      localStreamRef.current = stream
      
      const peer = new RTCPeerConnection(servers)
      stream.getTracks().forEach(track => peer.addTrack(track, stream))
      peerRef.current = peer

      peer.onicecandidate = (e) => {
        if (e.candidate) socket.emit('ice-candidate', { crisisId, candidate: e.candidate })
      }

      peer.ontrack = (e) => {
        const audio = new Audio()
        audio.srcObject = e.streams[0]
        audio.play()
      }

      const offer = await peer.createOffer()
      await peer.setLocalDescription(offer)
      socket.emit('call-offer', { crisisId, offer })

      setIsCallActive(true)
    } catch (err) {
      console.error('Call failed:', err)
      alert('Microphone access required for calls')
    }
  }, [crisisId, socket])

  const acceptCall = useCallback(async (incomingOffer) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false })
      localStreamRef.current = stream
      
      const peer = new RTCPeerConnection(servers)
      stream.getTracks().forEach(track => peer.addTrack(track, stream))
      peerRef.current = peer

      peer.onicecandidate = (e) => {
        if (e.candidate) socket.emit('ice-candidate', { crisisId, candidate: e.candidate })
      }

      peer.ontrack = (e) => {
        const audio = new Audio()
        audio.srcObject = e.streams[0]
        audio.play()
      }

      await peer.setRemoteDescription(new RTCSessionDescription(incomingOffer))
      const answer = await peer.createAnswer()
      await peer.setLocalDescription(answer)
      socket.emit('call-answer', { crisisId, answer })

      setIsCallActive(true)
      setIsIncoming(false)
    } catch (err) {
      console.error('Accept call failed:', err)
      alert('Microphone access required for calls')
    }
  }, [crisisId, socket])

  useEffect(() => {
    if (!socket) return

    socket.on('call-incoming', (data) => {
      setCallerName(data.callerName)
      setIsIncoming(true)
      // Store offer for acceptCall
      window._pendingOffer = data.offer
    })

    socket.on('call-answered', async (data) => {
      if (peerRef.current) {
        await peerRef.current.setRemoteDescription(new RTCSessionDescription(data.answer))
      }
    })

    socket.on('ice-candidate', async (data) => {
      if (peerRef.current && data.candidate) {
        await peerRef.current.addIceCandidate(new RTCIceCandidate(data.candidate))
      }
    })

    socket.on('call-ended', () => {
      endCall()
    })

    return () => {
      socket.off('call-incoming')
      socket.off('call-answered')
      socket.off('ice-candidate')
      socket.off('call-ended')
    }
  }, [socket])

  const endCall = useCallback(() => {
    if (peerRef.current) {
      peerRef.current.close()
      peerRef.current = null
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(t => t.stop())
      localStreamRef.current = null
    }
    socket.emit('call-end', { crisisId })
    setIsCallActive(false)
    setIsIncoming(false)
  }, [crisisId, socket])

  const acceptIncoming = useCallback(() => {
    if (window._pendingOffer) {
      acceptCall(window._pendingOffer)
      window._pendingOffer = null
    }
  }, [acceptCall])

  return { isCallActive, isIncoming, callerName, startCall, acceptIncoming, endCall }
}

// Need useEffect
import { useEffect } from 'react'
