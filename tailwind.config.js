/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Semantic Theme Tokens linked to CSS custom variables
        theme: {
          main: 'var(--theme-bg-main)',
          secondary: 'var(--theme-bg-secondary)',
          card: 'var(--theme-bg-card)',
          text: 'var(--theme-text-primary)',
          muted: 'var(--theme-text-secondary)',
          border: 'var(--theme-border)',
          accent: 'var(--theme-accent)',
          'accent-hover': 'var(--theme-accent-hover)',
          'accent-subtle': 'var(--theme-accent-subtle)',
          btn: 'var(--theme-btn-primary)',
          'btn-hover': 'var(--theme-btn-primary-hover)',
          'btn-text': 'var(--theme-btn-text)',
        },
        // Automatic backward-compatibility mappings
        'soft-grey': 'var(--theme-bg-secondary)',
        'muted-blue': 'var(--theme-text-secondary)',
        'border-light': 'var(--theme-border)',
        midnight: {
          DEFAULT: '#101A27',
          surface: '#162334',
          card: '#1C2B3D',
          border: '#334155',
          muted: '#A7B4C4',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        'premium': '0 10px 25px -5px rgba(16, 26, 39, 0.06), 0 8px 10px -6px rgba(16, 26, 39, 0.04)',
        'airline': '0 20px 30px -10px rgba(16, 26, 39, 0.08)',
      }
    },
  },
  plugins: [],
}
