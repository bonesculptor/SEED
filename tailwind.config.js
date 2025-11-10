/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#0a0e1a',
          surface: '#0f172a',
          border: '#1e293b',
          hover: '#1e293b',
          text: '#e2e8f0',
          muted: '#94a3b8',
        },
        cyber: {
          blue: '#00d4ff',
          cyan: '#00ffff',
          orange: '#ff9500',
          'blue-glow': '#0099cc',
        }
      },
    },
  },
  plugins: [],
};
