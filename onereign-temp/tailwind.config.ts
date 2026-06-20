import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Inter', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      colors: {
        brand: {
          black: '#0A0A0A',
          white: '#FFFFFF',
          muted: '#AAAAAA',
          ghost: '#E8E8E8',
        }
      }
    }
  },
  plugins: [],
}

export default config
