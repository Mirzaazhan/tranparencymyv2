/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Malaysian flag colors
        malaysia: {
          red: '#CC0000',
          blue: '#010066',
          yellow: '#FFCC00',
          white: '#FFFFFF'
        },
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        }
      },
      fontFamily: {
        sans: ['Nunito', 'Source Sans Pro', 'ui-sans-serif', 'system-ui'],
        display: ['Poppins', 'Nunito', 'ui-sans-serif', 'system-ui'],
        body: ['Source Sans Pro', 'Nunito', 'ui-sans-serif', 'system-ui'],
      }
    },
  },
  plugins: [],
}