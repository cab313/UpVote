import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0a0a0a',
        card: '#1a1a1a',
        'card-hover': '#252525',
        border: '#2a2a2a',
        'text-primary': '#ffffff',
        'text-secondary': '#a1a1a1',
        'text-muted': '#6b7280',
        status: {
          'under-review': '#f59e0b',
          planned: '#3b82f6',
          'in-progress': '#22c55e',
          implemented: '#8b5cf6',
          declined: '#ef4444',
        },
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
        'gradient-primary-hover': 'linear-gradient(135deg, #6d28d9 0%, #9333ea 100%)',
      },
    },
  },
  plugins: [],
};

export default config;
