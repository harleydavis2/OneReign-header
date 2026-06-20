import type { Metadata } from 'next'
import './globals.css'

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
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@100;300;400;500;700;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  )
}
