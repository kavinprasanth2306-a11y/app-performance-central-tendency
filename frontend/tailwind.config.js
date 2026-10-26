/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        space: {
          950: '#060a14',
          900: '#0b1120',
          850: '#0f172a',
          800: '#17223b',
          700: '#1e2d4d',
        },
        cyanGlow: {
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
        },
        violetGlow: {
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
        },
        emeraldGlow: {
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
        },
        amberGlow: {
          400: '#fbbf24',
          500: '#f59e0b',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.45)',
        'glass-hover': '0 12px 40px 0 rgba(6, 182, 212, 0.25)',
        'neon-cyan': '0 0 20px -3px rgba(6, 182, 212, 0.5)',
        'neon-violet': '0 0 20px -3px rgba(139, 92, 246, 0.5)',
      },
      backdropBlur: {
        'xs': '2px',
        'glass': '16px',
        'deep': '24px',
      }
    },
  },
  plugins: [],
};
