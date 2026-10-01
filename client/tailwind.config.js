/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        eoc: {
          navy: '#0B1120',
          dark: '#0F172A',
          card: '#1E293B',
          cardHover: '#283548',
          border: '#334155',
          cyan: '#06B6D4',
          blue: '#3B82F6',
          danger: '#EF4444',
          warning: '#F59E0B',
          safe: '#10B981',
          purple: '#8B5CF6'
        }
      },
      animation: {
        'pulse-fast': 'pulse 1.2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 10s linear infinite',
      }
    },
  },
  plugins: [],
};
