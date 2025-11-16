/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  // All colors are now defined in app/globals.css using @theme
  // This config file is kept minimal for Tailwind v4
  theme: {
    extend: {},
  },
  plugins: [],
}
