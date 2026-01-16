/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary-dark': '#002623',
        'primary-light': '#001a18',
        'primary-gold': '#b9a779',
        'primary-gold-light': '#d4af37',
        'primary-gold-very-light': '#e8dfc8',
      },
    },
  },
  plugins: [],
}
