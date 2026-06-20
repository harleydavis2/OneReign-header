import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], weight: ['100', '300', '400', '500', '700', '900'] })

export const metadata: Metadata = {
  title: 'OneReign — Creative Studio',
  description: 'We build what others only imagine. Creative studio specialising in digital experiences and brand identity.',
  keywords: ['creative studio', 'digital experiences', 'brand identity', 'OneReign'],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={inter.className}>
      <body>
        {children}
      </body>
    </html>
  )
}
