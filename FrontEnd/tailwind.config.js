/** @type {import('tailwindcss').Config} */

import colors from 'tailwindcss/colors'

export default {
  content: [
    "./index.html",
    "./src/**/*.{scss,js,ts,jsx,tsx}",
    "node_modules/@frostui/tailwindcss/dist/*.js"
  ],
  darkMode: ['class', '[data-mode="dark"]'],

  theme: {

    container: {
      center: true,
    },

    fontFamily: {
      sans: ['Figtree', 'sans-serif'],
    },

    extend: {
      colors: {
        'primary': '#0B8A96',
        'secondary': '#6c757d',
        'success': '#10B981',
        'info': '#0EA5E9',
        'warning': '#F59E0B',
        'danger': '#EF4444',
        'light': '#F5F5F5',
        'dark': '#052049',

        'gray': {
          ...colors.gray,
          '800': '#0F2744'
        }
      },

      keyframes: {
        load: {
          '0%': { width: '0%' },
          '100%': { width: '100%' },
        }
      },

      minWidth: theme => ({
        ...theme('width'),
      }),

      maxWidth: theme => ({
        ...theme('width'),
      }),

      minHeight: theme => ({
        ...theme('height'),
      }),

      maxHeight: theme => ({
        ...theme('height'),
      }),
    },
  },
  plugins: [
    require('@frostui/tailwindcss/plugin'),
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
  ],
}

