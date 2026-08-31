/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          950: '#060911',
          900: '#0b0f19',
          850: '#0f172a',
          800: '#131b2e',
          750: '#1e293b',
          700: '#334155'
        }
      }
    },
  },
  plugins: [],
}
