/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // تم استخراج هذه الألوان من ملف base.css
        primary: {
          DEFAULT: '#002623', // --primary
          dark: '#002623',    // --primary-dark
          light: '#b9a779',   // --primary-light (Gold)
          'very-light': '#f8fafc', // --primary-very-light
        },
        gold: {
          DEFAULT: '#b9a779', // --primary-gold
          dark: '#9a8660',    // Hover state
          light: '#d4af37',
        },
        page: '#f8fafc', // --bg-page
      },
      fontFamily: {
        // تم تعريف الخط الخاص بك هنا لتستخدمه كـ font-primary
        primary: ['"ITF Qomra Arabic Light"', 'Segoe UI', 'Tajawal', 'sans-serif'],
      },
    },
  },
  plugins: [],
}