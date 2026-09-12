import type { Config } from 'tailwindcss';

// Palette lifted verbatim from the approved prototypes
// (DS_Proposal/ds_panel_elite.html + ds_panel_pro.html).
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: '#0f2149',
        'navy-700': '#1c2c5c',
        'navy-600': '#22335f',
        'navy-400': '#6f7fa8',
        line: '#e6eaf2',
        canvas: '#f4f6fb',
        ink: '#1f2a44',
        mut: '#6b7794',
        brand: '#2563eb',
        gold: '#e0a11a',
        ok: '#1e9e5a',
        bad: '#e0483d',
        purp: '#7c3aed',
      },
      fontFamily: {
        sans: ['Segoe UI', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        card: '13px',
      },
      boxShadow: {
        card: '0 1px 2px rgba(15,33,73,.04)',
        pop: '0 8px 24px rgba(0,0,0,.2)',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to: { opacity: '1', transform: 'none' },
        },
      },
      animation: {
        fadeUp: 'fadeUp .2s ease',
      },
    },
  },
  plugins: [],
};

export default config;
