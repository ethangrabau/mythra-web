import localFont from 'next/font/local'

export const obraLetra = localFont({
  src: './fonts/ObraLetra.ttf',
  variable: '--font-obra',
  display: 'swap',
})

// Keep your existing fonts if you're using them
export const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  display: 'swap',
})

export const geist = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist',
  display: 'swap',
})