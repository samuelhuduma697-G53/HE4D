export const theme = {
  colors: {
    primary: {
      gold: '#F5B041',
      red: '#ff4d4d',
      blue: '#1e3a8a'
    },
    dark: {
      base: '#1a202c',
      elevated: '#2d3748',
      card: '#1e293b'
    },
    accent: {
      emergency: '#dc2626',
      success: '#22c55e',
      warning: '#eab308',
      info: '#3b82f6'
    },
    text: {
      primary: '#ffffff',
      secondary: '#a0aec0',
      muted: '#718096'
    }
  },
  
  shadows: {
    card: '0 10px 30px -10px rgba(0, 0, 0, 0.5)',
    glow: {
      gold: '0 0 20px rgba(245, 176, 65, 0.3)',
      red: '0 0 20px rgba(255, 77, 77, 0.3)'
    }
  },
  
  borderRadius: {
    card: '16px',
    input: '12px',
    button: '12px',
    modal: '20px'
  },
  
  animations: {
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms'
    },
    easing: {
      smooth: 'cubic-bezier(0.4, 0, 0.2, 1)'
    }
  },
  
  glassmorphism: {
    background: 'rgba(45, 55, 72, 0.8)',
    blur: '12px',
    border: '1px solid rgba(255, 255, 255, 0.1)'
  }
}

export default theme
