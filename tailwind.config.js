/** @type {import('tailwindcss').Config} */
export default {
  content: ['./tools/viewer/src/**/*.{html,js,svelte,ts}', './tools/viewer/index.html'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Dark mode design system colors
        'pmac-bg': {
          'primary': 'rgb(17 24 39)',    // bg-gray-900
          'secondary': 'rgb(31 41 55)',  // bg-gray-800
          'tertiary': 'rgb(55 65 81)',   // bg-gray-700
        },
        'pmac-text': {
          'primary': 'rgb(243 244 246)',   // text-gray-100
          'secondary': 'rgb(209 213 219)', // text-gray-300
          'muted': 'rgb(156 163 175)',     // text-gray-400
        },
        'pmac-status': {
          'completed': 'rgb(34 197 94)',    // green-500
          'in-progress': 'rgb(59 130 246)', // blue-500
          'pending': 'rgb(156 163 175)',    // gray-400
          'blocked': 'rgb(239 68 68)',      // red-500
        },
        'pmac-priority': {
          'critical': 'rgb(239 68 68)',   // red-500
          'high': 'rgb(249 115 22)',      // orange-500
          'medium': 'rgb(234 179 8)',     // yellow-500
          'low': 'rgb(34 197 94)',        // green-500
        }
      },
      boxShadow: {
        'dark': '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
        'dark-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2)',
      },
      animation: {
        'pulse-glow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}