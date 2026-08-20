/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        gym: {
          dark: '#0f172a',
          darker: '#020617',
          card: '#1e293b',
          cardLight: '#334155',
          border: '#334155',
          accent: '#10b981', // emerald green
          accentHover: '#059669',
          orange: '#f97316',
          blue: '#3b82f6',
          purple: '#8b5cf6',
          red: '#ef4444',
          gold: '#eab308'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
