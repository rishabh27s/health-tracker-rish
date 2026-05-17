/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        sage: {
          50: '#f3f8f4',
          100: '#e3eee5',
          200: '#c8ddcb',
          300: '#9fc4a4',
          400: '#73a47a',
          500: '#52885b',
          600: '#3f6e47',
          700: '#33583a',
          800: '#2b4631',
          900: '#243a29',
        },
        mist: {
          50: '#f4f8fb',
          100: '#e6eff5',
          200: '#cddfeb',
          300: '#a4c5d8',
          400: '#74a5bf',
          500: '#5288a6',
          600: '#3f6c8a',
          700: '#345772',
          800: '#2d495f',
          900: '#283e51',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 1px 2px rgba(16, 24, 40, 0.04), 0 4px 16px rgba(16, 24, 40, 0.06)',
      },
    },
  },
  plugins: [],
};
