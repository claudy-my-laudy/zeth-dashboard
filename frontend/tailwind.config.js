/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0F0F0F',
        card: '#1A1A1A',
        accent: '#FF6B2B',
        border: '#2A2A2A',
      }
    }
  },
  plugins: []
}
