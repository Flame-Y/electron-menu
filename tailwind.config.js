/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{vue,js,ts,jsx,tsx}', './index.html'],
  theme: {
    extend: {
      colors: {
        'ev-white': '#ffffff',
        'ev-white-soft': '#f8f8f8',
        'ev-white-mute': '#f2f2f2',
        'ev-black': '#1b1b1f',
        'ev-black-soft': '#222222',
        'ev-black-mute': '#282828',
        'ev-gray-1': '#515c67',
        'ev-gray-2': '#414853',
        'ev-gray-3': '#32363f'
      }
    }
  },
  plugins: []
}
