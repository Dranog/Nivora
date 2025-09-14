import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/app/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
    './src/lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#FFFFFF',
        foreground: '#0F172A',
        primary: { DEFAULT: '#6E56CF', foreground: '#FFFFFF' },
        accent: { DEFAULT: '#12B981', foreground: '#0B1D16' },
        destructive: { DEFAULT: '#EF4444', foreground: '#FFFFFF' },
        muted: '#F3F4F6',
        border: '#E5E7EB',
        info: '#3B82F6',
        warning: '#F59E0B',
      },
      boxShadow: {
        card: '0 2px 10px rgba(15,23,42,0.06)',
        popover: '0 6px 24px rgba(15,23,42,0.10)',
        modal: '0 20px 48px rgba(15,23,42,0.20)',
      },
      borderRadius: { sm: '8px', md: '14px', lg: '20px' },
      fontFamily: { sans: ['Inter', 'ui-sans-serif', 'system-ui'] },
    },
  },
  plugins: [],
}
export default config
