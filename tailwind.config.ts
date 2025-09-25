import type { Config } from 'tailwindcss'

const config: Config = {
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
        'brand': {
          'primary': '#92400e',
          'secondary': '#d97706',
          'accent': '#fbbf24',
        },
        'surface': {
          'primary': '#ffffff',
          'secondary': '#f8fafc',
          'tertiary': '#f1f5f9',
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
        'section': '4rem',
        'container': '1.5rem',
      },
    },
  },
  plugins: [],
}

export default config