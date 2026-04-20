/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        cream: { 50: '#FFFEF7', 100: '#FFFCEB', 200: '#FFF8D6', 300: '#FFF0B0' },
        peach: { 50: '#FFF5F0', 100: '#FFE8DC', 200: '#FFD4C0', 300: '#FFB89A', 400: '#FF9B73', 500: '#FF7F50' },
        sage: { 50: '#F0F5F0', 100: '#D8E8D8', 200: '#B8D4B8', 300: '#8FBB8F', 400: '#6FA56F', 500: '#4F8A4F' },
        sky: { 50: '#F0F7FF', 100: '#DCEEFF', 200: '#B8DDFF', 300: '#8ACAFF', 400: '#5CB5FF', 500: '#2E9EFF' },
        lavender: { 50: '#F5F0FF', 100: '#E8DCFF', 200: '#D4C0FF', 300: '#BB9AFF', 400: '#A373FF', 500: '#8B50FF' },
        rose: { 50: '#FFF0F3', 100: '#FFDCE3', 200: '#FFC0CF', 300: '#FF9AB5', 400: '#FF739B', 500: '#FF5080' },
      },
      fontFamily: {
        display: ['"Nunito"', 'sans-serif'],
        body: ['"Quicksand"', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0,0,0,0.07), 0 10px 20px -2px rgba(0,0,0,0.04)',
        'glow': '0 0 20px rgba(255,127,80,0.15)',
        'card': '0 4px 24px -4px rgba(0,0,0,0.08)',
      }
    },
  },
  plugins: [],
};
