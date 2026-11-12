import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './features/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      colors: {
        // Kaira Design System - Obsidian palette
        obsidian: {
          50:  '#f0f4f8',
          100: '#d9e2ec',
          200: '#bcccdc',
          300: '#9fb3c8',
          400: '#829ab1',
          500: '#627d98',
          600: '#486581',
          700: '#334e68',
          800: '#243b53',
          900: '#102a43',
          950: '#0a1929',
        },
        // Primary accent - Aurora teal
        aurora: {
          50:  '#e6fff9',
          100: '#b3ffef',
          200: '#80ffe4',
          300: '#4dffd9',
          400: '#1affc9',
          500: '#00e6b0',
          600: '#00b38a',
          700: '#008063',
          800: '#004d3c',
          900: '#001a14',
        },
        // Slate surface palette
        slate: {
          850: '#1a2234',
          950: '#0d1424',
        },
      },
      animation: {
        'fade-in':       'fadeIn 0.25s ease-out both',
        'slide-up':      'slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) both',
        'slide-down':    'slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1) both',
        'scale-in':      'scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) both',
        'pulse-aurora':  'pulseAurora 2.5s ease-in-out infinite',
        'shimmer':       'shimmer 2s linear infinite',
        'bounce-dot':    'bounceDot 1.4s ease-in-out infinite',
        'glow-pulse':    'glowPulse 2s ease-in-out infinite',
        'typing-dot':    'typingDot 1.4s ease-in-out infinite',
        'stream':        'stream 0.1s ease-out both',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(16px) scale(0.97)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        slideDown: {
          '0%':   { opacity: '0', transform: 'translateY(-8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%':   { opacity: '0', transform: 'scale(0.92)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        pulseAurora: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.4' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        bounceDot: {
          '0%, 80%, 100%': { transform: 'scale(0)', opacity: '0.3' },
          '40%':           { transform: 'scale(1)',   opacity: '1' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 8px 0px rgba(0, 230, 176, 0.3)' },
          '50%':      { boxShadow: '0 0 20px 4px rgba(0, 230, 176, 0.6)' },
        },
        typingDot: {
          '0%, 60%, 100%': { transform: 'translateY(0)', opacity: '0.4' },
          '30%':           { transform: 'translateY(-6px)', opacity: '1' },
        },
        stream: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'kaira': '0 0 0 1px rgba(0,230,176,0.15), 0 8px 32px rgba(0,0,0,0.4)',
        'kaira-lg': '0 0 0 1px rgba(0,230,176,0.2), 0 20px 60px rgba(0,0,0,0.5)',
        'message': '0 2px 12px rgba(0,0,0,0.25), 0 1px 3px rgba(0,0,0,0.15)',
        'input': '0 0 0 1.5px rgba(0,230,176,0.35), 0 8px 24px rgba(0,0,0,0.3)',
        'float': '0 4px 24px rgba(0,0,0,0.4), 0 1px 4px rgba(0,0,0,0.2)',
      },
    },
  },
  plugins: [],
};

export default config;
