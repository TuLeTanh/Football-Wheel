/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: 'var(--tw-bg)',
        surface: 'var(--tw-surface)',
        surface2: 'var(--tw-surface-2)',
        text: 'var(--tw-text)',
        textDim: 'var(--tw-text-dim)',
        club: 'var(--tw-accent-club)',
        national: 'var(--tw-accent-national)',
        legend: 'var(--tw-accent-legend)',
        danger: 'var(--tw-danger)',
        line: 'var(--tw-line)'
      },
      fontFamily: {
        display: ['"Oswald"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace']
      },
      borderRadius: {
        card: '20px',
        btn: '16px'
      },
      spacing: {
        safe: '24px'
      },
      boxShadow: {
        floodlight: '0 0 120px 40px rgba(53, 208, 127, 0.08)',
        card: '0 8px 24px rgba(0,0,0,0.35)'
      },
      keyframes: {
        'sweep': {
          '0%': { transform: 'translateX(-120%) rotate(8deg)', opacity: '0' },
          '40%': { opacity: '0.55' },
          '100%': { transform: 'translateX(120%) rotate(8deg)', opacity: '0' }
        },
        'pop-in': {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' }
        }
      },
      animation: {
        sweep: 'sweep 900ms ease-out',
        'pop-in': 'pop-in 350ms cubic-bezier(.2,.8,.2,1)'
      }
    }
  },
  plugins: []
};
