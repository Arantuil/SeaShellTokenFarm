/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        's': {'max': '640px'},
        'xs': {'max': '525px'},
        '2xs': {'max': '425px'},
        '3xs': {'max': '375px'},
        '4xs': {'max': '320px'},
        '3xl': {'min': '1750px'},
      }
    },
  },
  plugins: [],
}