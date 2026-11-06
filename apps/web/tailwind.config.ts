import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brew: {
          50: '#fbf7f2',
          100: '#f3e9dc',
          200: '#e6d0b5',
          300: '#d4b08a',
          400: '#c08c5f',
          500: '#a86f43',
          600: '#8a5733',
          700: '#6e432a',
          800: '#593726',
          900: '#4a2f22',
        },
        cream: '#fffaf3',
      },
      boxShadow: {
        card: '0 1px 2px rgba(74,47,34,.06), 0 4px 12px rgba(74,47,34,.08)',
      },
    },
  },
  plugins: [],
};
export default config;
