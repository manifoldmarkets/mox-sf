/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['var(--font-geist)', 'sans-serif'],
        'playfair': ['var(--font-playfair)', 'serif'],
        'lora': ['var(--font-lora)', 'serif'],
        'castoro': ['var(--font-castoro)', 'serif'],
        'geist-mono': ['var(--font-geist-mono)', 'monospace'],
      },
      colors: {
        // Brand colors - easier to change globally
        'brand': {
          'primary': '#92400e',    // amber-800
          'secondary': '#d97706',  // amber-600
          'accent': '#fbbf24',     // amber-400
        },
        'surface': {
          'primary': '#ffffff',    // white
          'secondary': '#f8fafc',  // slate-50
          'tertiary': '#f1f5f9',   // slate-100
        },
        'beige': {
          50: '#f9f6f0',
        },
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'card-lg': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
      },
      borderRadius: {
        'card': '0.5rem',
      },
      spacing: {
        'section': '4rem',    // 64px for section spacing
        'container': '1.5rem', // 24px for container padding
      },
    },
  },
  plugins: [],
}
