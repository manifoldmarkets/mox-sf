/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // ============================================
        // PRIMARY BRAND COLORS
        // Currently amber - change these to retheme the entire site
        // ============================================
        primary: {
          50: '#fffbeb',   // Lightest tint
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',  // Used for dark mode headings
          500: '#f59e0b',
          600: '#d97706',  // Hover state for links
          700: '#b45309',  // Icons, borders
          800: '#92400e',  // Main brand color - headings, buttons, links
          900: '#78350f',  // Darkest - hover states
        },

        // ============================================
        // SEMANTIC BRAND ALIASES
        // Use these for maximum flexibility when theming
        // ============================================
        brand: {
          DEFAULT: '#92400e',    // primary-800 - main brand color
          light: '#b45309',      // primary-700
          dark: '#78350f',       // primary-900
          'dark-mode': '#fbbf24', // primary-400 - for dark mode
        },

        // ============================================
        // BACKGROUND COLORS
        // ============================================
        background: {
          page: '#f8fafc',       // slate-50 - main page background (light)
          'page-warm': '#f9f6f0', // beige - for special pages (join, hacks)
          'page-dark': '#111827', // gray-900 - page background (dark)

          surface: '#ffffff',     // white - card backgrounds (light)
          'surface-dark': '#1f2937', // gray-800 - cards (dark)

          accent: '#fff7ed',      // orange-50 - highlighted cards (light)
          'accent-dark': '#1f2937', // gray-800 - highlighted cards (dark)

          subtle: '#f3f4f6',      // gray-100 - very subtle backgrounds
          'subtle-dark': '#374151', // gray-700
        },

        // ============================================
        // TEXT COLORS
        // Semantic hierarchy for text
        // ============================================
        text: {
          primary: '#1f2937',     // gray-800 - main text (light)
          'primary-dark': '#f3f4f6', // gray-100 - main text (dark)

          secondary: '#374151',   // gray-700 - body text (light)
          'secondary-dark': '#e5e7eb', // gray-200 - body text (dark)

          tertiary: '#4b5563',    // gray-600 - supporting text (light)
          'tertiary-dark': '#d1d5db', // gray-300 - supporting text (dark)

          muted: '#6b7280',       // gray-500 - muted text (light)
          'muted-dark': '#9ca3af', // gray-400 - muted text (dark)

          subtle: '#9ca3af',      // gray-400 - very subtle text (light)
          'subtle-dark': '#6b7280', // gray-500 - very subtle text (dark)
        },

        // ============================================
        // BORDER COLORS
        // ============================================
        border: {
          light: '#e5e7eb',       // gray-200 - standard borders (light)
          'light-dark': '#374151', // gray-700 - standard borders (dark)

          medium: '#d1d5db',      // gray-300
          'medium-dark': '#4b5563', // gray-600

          subtle: '#f1f5f9',      // slate-100 - very subtle
          'subtle-dark': '#1f2937', // gray-800

          strong: '#92400e',      // brand - emphasized borders
          'strong-alt': '#b45309', // brand-light
        },

        // ============================================
        // STATE COLORS
        // For badges, alerts, status indicators
        // ============================================
        success: {
          bg: '#dcfce7',          // green-100 (light)
          text: '#166534',        // green-800 (light)
          'bg-dark': '#14532d',   // green-900 with opacity
          'text-dark': '#4ade80', // green-400 (dark)
          icon: '#22c55e',        // green-500
        },

        error: {
          bg: '#fee2e2',          // red-100 (light)
          text: '#991b1b',        // red-800 (light)
          'bg-dark': '#7f1d1d',   // red-900 with opacity
          'text-dark': '#f87171', // red-400 (dark)
          button: '#dc2626',      // red-600 - delete buttons
          'button-hover': '#b91c1c', // red-700
        },

        info: {
          bg: '#dbeafe',          // blue-100 (light)
          text: '#1e40af',        // blue-800 (light)
          'bg-dark': '#1e3a8a',   // blue-900 with opacity
          'text-dark': '#60a5fa', // blue-400 (dark)
          button: '#2563eb',      // blue-600
          'button-hover': '#1d4ed8', // blue-700
        },

        warning: {
          bg: '#fef3c7',          // yellow-100 (light)
          text: '#92400e',        // yellow-800 (light)
          'bg-dark': '#713f12',   // yellow-900 with opacity
          'text-dark': '#fbbf24', // yellow-400 (dark)
        },

        // Additional badge colors
        category: {
          purple: {
            bg: '#f3e8ff',        // purple-100
            text: '#6b21a8',      // purple-800
            'bg-dark': '#581c87',
            'text-dark': '#c084fc', // purple-400
          },
          teal: {
            bg: '#ccfbf1',        // teal-100
            text: '#115e59',      // teal-800
            'bg-dark': '#134e4a',
            'text-dark': '#5eead4', // teal-400
          },
          orange: {
            bg: '#ffedd5',        // orange-100
            text: '#9a3412',      // orange-800
            'bg-dark': '#7c2d12',
            'text-dark': '#fb923c', // orange-400
          },
        },

        // ============================================
        // EXTERNAL SERVICE COLORS
        // Brand colors for third-party integrations
        // ============================================
        google: {
          DEFAULT: '#4285f4',
          hover: '#3367d6',
        },
        outlook: {
          DEFAULT: '#0078d4',
          hover: '#106ebe',
        },

        // ============================================
        // LEGACY/SPECIAL COLORS
        // Keep for backwards compatibility
        // ============================================
        beige: {
          50: '#f9f6f0',  // Warm background for join/hacks pages
        },
      },
    },
  },
  plugins: [],
}
