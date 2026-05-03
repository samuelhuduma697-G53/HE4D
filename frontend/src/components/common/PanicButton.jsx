import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCrisis } from '../../hooks/useCrisis'
import { useGeolocation } from '../../hooks/useGeolocation'
import { useSocket } from '../../hooks/useSocket'
import toast from 'react-hot-toast'

export const PanicButton = ({ className = '' }) => {
  const [isPressed, setIsPressed] = useState(false)
  const [countdown, setCountdown] = useState(3)
  const [isConfirming, setIsConfirming] = useState(false)
  const { triggerPanic } = useCrisis()
  const { location, getCurrentPosition } = useGeolocation()
  const { emit } = useSocket()

  // Drag state
  const [pos, setPos] = useState({ x: 24, y: 24 })
  const dragging = useRef(false)
  const startDrag = useRef({ x: 0, y: 0 })
  const startPos = useRef({ x: 24, y: 24 })
  const moved = useRef(false)

  const onPointerDown = (e) => {
    dragging.current = true
    moved.current = false
    startDrag.current = { x: e.clientX, y: e.clientY }
    startPos.current = { ...pos }
    e.preventDefault()
  }

  const onPointerMove = (e) => {
    if (!dragging.current) return
    const dx = e.clientX - startDrag.current.x
    const dy = e.clientY - startDrag.current.y
    if (Math.abs(dx) > 2 || Math.abs(dy) > 2) moved.current = true
    setPos({
      x: startPos.current.x - dx,
      y: startPos.current.y - dy
    })
  }

  const onPointerUp = () => {
    dragging.current = false
    if (!moved.current) {
      setIsConfirming(true)
    }
  }

  const handlePanic = useCallback(async () => {
    setIsConfirming(false)
    setIsPressed(true)
    setCountdown(3)

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) { clearInterval(timer); return 0 }
        return prev - 1
      })
    }, 1000)

    setTimeout(async () => {
      try {
        let lat = location?.latitude
        let lng = location?.longitude
        if (!lat || !lng) {
          const pos = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 })
          })
          lat = pos.coords.latitude
          lng = pos.coords.longitude
        }
        await triggerPanic(lat, lng, 'PANIC BUTTON ACTIVATED')
        emit('panic-alert', { latitude: lat, longitude: lng })
        toast.error('🚨 EMERGENCY ALERT SENT! Help is on the way.')
      } catch (error) {
        toast.error('Failed to send emergency alert. Call 119 or 999 directly!')
      }
      setIsPressed(false)
    }, 3000)
  }, [location, triggerPanic, emit])

  return (
    <>
      <motion.button
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`fixed z-40 w-20 h-20 md:w-24 md:h-24 rounded-full bg-accent-emergency shadow-[0_0_30px_rgba(220,38,38,0.5)] hover:shadow-[0_0_50px_rgba(220,38,38,0.7)] flex flex-col items-center justify-center text-white font-bold transition-all duration-300 border-4 border-white/20 cursor-grab active:cursor-grabbing select-none touch-none ${className}`}
        style={{ right: `${pos.x}px`, bottom: `${pos.y}px` }}
        animate={{ boxShadow: ['0 0 15px rgba(220,38,38,0.4)', '0 0 35px rgba(220,38,38,0.6)', '0 0 15px rgba(220,38,38,0.4)'] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <span className="text-2xl md:text-3xl">🆘</span>
        <span className="text-xs md:text-sm mt-1">PANIC</span>
      </motion.button>

      <AnimatePresence>
        {isConfirming && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="glass-card p-8 max-w-md text-center">
              <div className="text-6xl mb-4">🚨</div>
              <h2 className="text-2xl font-bold text-accent-emergency mb-4">Confirm Emergency</h2>
              <p className="text-gray-300 mb-6">This will immediately alert all nearby helpers and emergency contacts. Your location will be shared.</p>
              <div className="flex gap-4">
                <button onClick={() => setIsConfirming(false)} className="flex-1 btn-secondary">Cancel</button>
                <button onClick={handlePanic} className="flex-1 bg-accent-emergency hover:bg-red-700 text-white font-bold py-3 rounded-xl">Yes, Send Alert</button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {isPressed && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center">
            <div className="text-center">
              <div className="text-8xl mb-4 animate-pulse">🚨</div>
              <h2 className="text-4xl font-bold text-accent-emergency mb-4">SENDING EMERGENCY ALERT</h2>
              <p className="text-6xl font-bold text-white mb-4">{countdown}</p>
              <p className="text-gray-400">Your location is being shared. Help is on the way.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
