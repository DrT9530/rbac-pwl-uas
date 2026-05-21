/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef2f7',
          100: '#d4dde9',
          200: '#a9bbd3',
          300: '#7e99bd',
          400: '#5377a7',
          500: '#1e3a5f',
          600: '#1a3356',
          700: '#152b48',
          800: '#10213a',
          900: '#0b172c',
          950: '#060d1a',
        },
        accent: {
          50: '#effefa',
          100: '#c7fff0',
          200: '#90ffe2',
          300: '#51f7d0',
          400: '#1de4b9',
          500: '#0d9488',
          600: '#08786e',
          700: '#0b6059',
          800: '#0e4d48',
          900: '#10403c',
          950: '#022624',
        },
        sidebar: '#0f172a',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'spin-slow': 'spin 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
};
