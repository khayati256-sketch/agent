/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          500: '#7c3aed',
          600: '#6d28d9',
          700: '#5b21b6',
        },
        accent: {
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
        },
        success: {
          400: '#34d399',
          500: '#10b981',
        },
        danger: {
          400: '#fb7185',
          500: '#f43f5e',
        },
        surface: {
          800: '#1f2937',
          900: '#0f172a',
          950: '#020617',
        },
      },
      fontFamily: {
        sans: ['"Space Grotesk"', '"Segoe UI"', 'sans-serif'],
        display: ['"Orbitron"', '"Space Grotesk"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      boxShadow: {
        panel: '0 20px 50px rgba(2, 6, 23, 0.55)',
        glow: '0 0 0 1px rgba(34, 211, 238, 0.3), 0 0 28px rgba(34, 211, 238, 0.22)',
        neon: '0 0 24px rgba(124, 58, 237, 0.35)',
      },
      keyframes: {
        'glow-pulse': {
          '0%, 100%': {
            boxShadow: '0 0 0 1px rgba(34, 211, 238, 0.2), 0 0 12px rgba(34, 211, 238, 0.16)',
          },
          '50%': {
            boxShadow: '0 0 0 1px rgba(34, 211, 238, 0.5), 0 0 24px rgba(34, 211, 238, 0.45)',
          },
        },
        breathe: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.06)' },
        },
        ripple: {
          '0%': { transform: 'scale(0.9)', opacity: '0.75' },
          '100%': { transform: 'scale(1.45)', opacity: '0' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        floaty: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
      animation: {
        'glow-pulse': 'glow-pulse 2.8s ease-in-out infinite',
        breathe: 'breathe 2.8s ease-in-out infinite',
        ripple: 'ripple 1.8s ease-out infinite',
        shimmer: 'shimmer 2.2s linear infinite',
        floaty: 'floaty 6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
