/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        page: '#F7F8FA',
        surface: '#FFFFFF',
        'surface-elevated': '#FFFFFF',
        'surface-secondary': '#F3F5F8',
        'surface-subtle': '#FAFAFC',
        border: {
          DEFAULT: '#E4E7EC',
          subtle: '#F0F2F5',
          strong: '#D0D5DD'
        },
        ink: {
          DEFAULT: '#101828',
          primary: '#101828',
          secondary: '#667085',
          muted: '#98A2B3',
          light: '#D0D5DD'
        },
        brand: {
          DEFAULT: '#2563EB',
          hover: '#1D4ED8',
          subtle: '#EFF4FF',
          border: '#D1E0FF'
        },
        status: {
          pass: '#059669',
          'pass-bg': '#ECFDF5',
          'pass-border': '#A7F3D0',
          review: '#D97706',
          'review-bg': '#FFFBEB',
          'review-border': '#FDE68A',
          fail: '#D92D20',
          'fail-bg': '#FEF3F2',
          'fail-border': '#FECDCA',
          info: '#2563EB',
          'info-bg': '#EFF4FF',
          'info-border': '#D1E0FF'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
        serif: ['Newsreader', 'Georgia', 'serif'],
        display: ['Instrument Serif', 'Newsreader', 'Georgia', 'serif']
      },
      boxShadow: {
        'saas-xs': '0 1px 2px 0 rgba(16, 24, 40, 0.04)',
        'saas-sm': '0 1px 3px 0 rgba(16, 24, 40, 0.05), 0 1px 2px -1px rgba(16, 24, 40, 0.03)',
        'saas-md': '0 4px 12px -2px rgba(16, 24, 40, 0.06), 0 2px 4px -2px rgba(16, 24, 40, 0.03)',
        'saas-lg': '0 12px 24px -4px rgba(16, 24, 40, 0.07), 0 4px 6px -2px rgba(16, 24, 40, 0.02)',
        'saas-xl': '0 20px 30px -6px rgba(16, 24, 40, 0.08), 0 8px 10px -4px rgba(16, 24, 40, 0.03)'
      }
    },
  },
  plugins: [],
}
