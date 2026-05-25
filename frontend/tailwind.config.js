/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enables class-based dark/light toggling
  theme: {
    extend: {
      colors: {
        // Deep Space Premium Colors
        space: {
          900: '#030014',
          800: '#090520',
          700: '#120b38',
          600: '#1b124c',
        },
        glow: {
          purple: '#8b5cf6',
          indigo: '#6366f1',
          pink: '#ec4899',
        }
      },
      animation: {
        'float-slow': 'float 8s ease-in-out infinite',
        'float-medium': 'float 5s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
        'typing': 'typing 1.4s infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-15px)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: 0.6, filter: 'drop-shadow(0 0 15px rgba(139, 92, 246, 0.4))' },
          '50%': { opacity: 1, filter: 'drop-shadow(0 0 25px rgba(99, 102, 241, 0.7))' },
        },
        typing: {
          '0%, 100%': { transform: 'translateY(0px)', opacity: 0.4 },
          '50%': { transform: 'translateY(-6px)', opacity: 1 },
        }
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
