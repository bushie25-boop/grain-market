/** @type {import('tailwindcss').Config} */
export default {
  content: ['./client/**/*.{html,tsx,ts,jsx,js}'],
  theme: {
    extend: {
      colors: {
        bg: '#0F1A0F',
        card: '#1A2E1A',
        'card-border': '#2A4A2A',
        gold: '#D4A017',
        amber: '#C47B1C',
        primary: '#E8E8E0',
        muted: '#8FA88F',
        up: '#4CAF50',
        down: '#E53935',
        neutral: '#FFC107',
      },
    },
  },
  plugins: [],
}
