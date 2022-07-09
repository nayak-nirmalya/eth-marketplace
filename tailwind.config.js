const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
  content: ['./pages/**/*.{html,js}', './components/**/*.{html,js}'],
  theme: {
    screens: {
      xs: '475px',
      ...defaultTheme.screens,
    },
    extend: {
      flex: {
        '2': '2 2 0%',
        '3': '3 3 0%',
        '4': '4 4 0%',
      },
      opacity: ['disabled'],
      cursor: ['disabled'],
    },
  },
  plugins: [],
}
