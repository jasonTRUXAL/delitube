/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fff9f0',
          100: '#fff2e0',
          200: '#ffe4c1',
          300: '#ffd5a2',
          400: '#ffc582', // Main orange
          500: '#ffb563',
          600: '#e6a356',
          700: '#cc914a',
          800: '#b37f3d',
          900: '#996d31',
          950: '#805b24',
        },
        secondary: {
          50: '#fef9f5',
          100: '#fdf3eb',
          200: '#fbe7d7',
          300: '#f9dbc3',
          400: '#f7cfaf',
          500: '#f5c39b',
          600: '#f3b787',
          700: '#f1ab73',
          800: '#ef9f5f',
          900: '#ed934b',
          950: '#eb8737',
        },
        accent: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
          950: '#450a0a',
        },
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          950: '#451a03',
        },
        brutal: {
          black: '#000000',
          white: '#ffffff',
          gray: '#808080',
          cream: '#f9fbf5', // Main background
          'dark-brown': '#2d1b1a', // Dark mode background - much darker
        }
      },
      backgroundColor: {
        'main': '#f9fbf5',
        'dark-main': '#2d1b1a',
      },
      fontFamily: {
        sans: [
          'Space Grotesk',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
        mono: [
          'JetBrains Mono',
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'Consolas',
          'Liberation Mono',
          'Courier New',
          'monospace',
        ],
      },
      boxShadow: {
        'brutal': '4px 4px 0px 0px #000000',
        'brutal-lg': '8px 8px 0px 0px #000000',
        'brutal-orange': '4px 4px 0px 0px #ffc582',
        'brutal-orange-lg': '8px 8px 0px 0px #ffc582',
        'brutal-dark': '4px 4px 0px 0px #000000', // Keep shadows black in dark mode
        'brutal-dark-lg': '8px 8px 0px 0px #000000', // Keep shadows black in dark mode
      },
      borderWidth: {
        '3': '3px',
        '4': '4px',
        '5': '5px',
      }
    },
  },
  plugins: [],
  darkMode: 'class',
};