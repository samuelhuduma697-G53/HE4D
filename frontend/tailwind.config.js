/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
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
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate'
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px #F5B041, 0 0 10px #F5B041' },
          '100%': { boxShadow: '0 0 20px #F5B041, 0 0 30px #F5B041' }
        }
      },
      backdropBlur: {
        xs: '2px'
      }
    }
  },
  plugins: []
}
