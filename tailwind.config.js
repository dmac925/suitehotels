/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        luxury: {
          black: '#0a0a0a',
          charcoal: '#1a1a1a',
          blue: '#f59e0b',  // Changed to amber-500 for luxury gold accent
          lightblue: '#fef3c7',  // Changed to amber-100 for light accent
          pearl: '#fffbf0',  // Warmer pearl with slight amber tint
          silver: '#e2e8f0',  // Softer silver-gray
          gold: '#f59e0b',  // Explicit gold/amber for clarity
          slate: '#1e293b',  // Deep slate for rich backgrounds
        }
      },
      fontFamily: {
        'heading': ['Manrope', 'system-ui', 'sans-serif'],
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.8s ease-in-out',
        'slide-up': 'slideUp 0.6s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
} 