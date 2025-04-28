/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        righteous: ['var(--font-righteous)', 'sans-serif'],
        josefin: ['var(--font-josefin)'],
      },
      keyframes: {
        glow: {
          '0%, 100%': { textShadow: '0 0 8px rgba(255, 215, 0, 0.7)' },
          '50%': { textShadow: '0 0 16px rgba(255, 215, 0, 0.9)' },
        },
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        glow: 'glow 2s ease-in-out infinite',
        'fade-in': 'fade-in 0.3s ease-out forwards',
      },
    },
  },
  plugins: [],
} 