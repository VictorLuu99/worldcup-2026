import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'bg-deep': '#001d3d',
        'bg-base': '#0a2540',
        'bg-elev': '#1d3557',
        gold: '#ffd60a',
        'phase-group': '#ffd60a',
        'phase-r32': '#a855f7',
        'phase-r16': '#00b4d8',
        'phase-qf': '#22c55e',
        'phase-sf': '#f472b6',
        'phase-third': '#94a3b8',
      },
      fontFamily: {
        display: ['"Bebas Neue"', 'Impact', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      screens: { sm: '480px', md: '768px', lg: '1024px', xl: '1280px' },
    },
  },
  plugins: [],
} satisfies Config;
