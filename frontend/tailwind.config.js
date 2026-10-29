/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#f0f4f9',
          100: '#e1e9f3',
          200: '#c3d3e7',
          300: '#94b3d7',
          400: '#5f8ec2',
          500: '#3a70ad',
          600: '#2c5991',
          700: '#244776',
          800: '#1a3254',
          900: '#0f1f38',
          950: '#0a1424',
        },
        gold: {
          50: '#fdfbf2',
          100: '#faf5de',
          200: '#f4e9be',
          300: '#ecda94',
          400: '#e1c667',
          500: '#d4b140',
          600: '#b89431',
          700: '#937128',
          800: '#795a25',
          900: '#674c23',
          950: '#3b290f',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['Cinzel', 'Playfair Display', 'Georgia', 'serif'],
      },
      boxShadow: {
        'premium': '0 10px 30px -5px rgba(15, 31, 56, 0.08), 0 4px 6px -2px rgba(15, 31, 56, 0.04)',
        'premium-lg': '0 20px 40px -10px rgba(15, 31, 56, 0.12), 0 8px 12px -3px rgba(15, 31, 56, 0.06)',
      }
    },
  },
  plugins: [],
}
