
import preset, { content } from 'frappe-ui/tailwind'
import colors from 'tailwindcss/colors'

export default {
  presets: [preset],
  content: [
    ...content,
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        'primary-soft': 'var(--color-primary-soft)',
        accent: 'var(--color-accent)',
        'accent-soft': 'var(--color-accent-soft)',

        // Restore the palette used by existing portal screens.
        red: colors.red,
        stone: colors.stone,
        emerald: colors.emerald,
        amber: colors.amber,
      },

      fontFamily: {
        sans: ['Manrope', 'Avenir Next', 'Segoe UI', 'sans-serif'],
      },

      // Backwards compatibility with the portal's original Tailwind classes.
      borderRadius: {
        DEFAULT: '8px',
        sm: '4px',
        md: '10px',
        lg: '12px',
        xl: '16px',
        '2xl': '20px',
        '3xl': '24px',
      },

      boxShadow: {
        inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
      },
    },
  },
}
