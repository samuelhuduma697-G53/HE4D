import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'

export const Toast = ({ message, type = 'info', duration = 4000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(onClose, 300)
    }, duration)
    return () => clearTimeout(timer)
  }, [duration, onClose])

  const colors = {
    success: 'bg-accent-success/20 border-accent-success text-accent-success',
    error: 'bg-accent-emergency/20 border-accent-emergency text-accent-emergency',
    warning: 'bg-accent-warning/20 border-accent-warning text-accent-warning',
    info: 'bg-accent-info/20 border-accent-info text-accent-info'
  }

  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20, x: 20 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          className={`
            fixed top-20 right-4 z-[100]
            px-4 py-3 rounded-xl border
            backdrop-blur-xl shadow-2xl
            flex items-center gap-3
            ${colors[type]}
          `}
        >
          <span className="text-lg">{icons[type]}</span>
          <span>{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
