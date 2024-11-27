import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        obra: ['var(--font-obra)'],
        geist: ['var(--font-geist)'],
        'geist-mono': ['var(--font-geist-mono)'],
      },
    },
  },
  plugins: [],
}

export default config