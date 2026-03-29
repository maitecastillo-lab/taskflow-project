/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ["./*.{html,js}"], 
  theme: {
    extend: {
      fontFamily: {
        'trebuchet': ['"Trebuchet MS"', 'sans-serif'],
      }
    },
  },
  plugins: [],
}