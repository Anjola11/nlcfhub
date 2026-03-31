/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'canvas': 'var(--bg-canvas)',
        'canvas-dim': 'var(--bg-canvas-dim)',
        'surface-navy': 'var(--surface-navy)',
        'surface-gold': 'var(--surface-gold)',
        'surface-white': 'var(--surface-white)',
        'surface-overlay': 'var(--surface-overlay)',
        'text-primary': 'var(--text-primary)',
        'text-inverse': 'var(--text-inverse)',
        'text-secondary': 'var(--text-secondary)',
        'text-muted': 'var(--text-muted)',
        'border-subtle': 'var(--border-subtle)',
        'border-focus': 'var(--border-focus)',
        'status-success': 'var(--status-success)',
        'status-error': 'var(--status-error)',
        'status-warning': 'var(--status-warning)',
      },
      borderRadius: {
        'card': 'var(--radius-card)',
        'button': 'var(--radius-button)',
        'input': 'var(--radius-input)',
        'badge': 'var(--radius-badge)',
        'modal': 'var(--radius-modal)',
        'avatar': 'var(--radius-avatar)',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      }
    },
  },
  plugins: [],
}
