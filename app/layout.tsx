import type { Metadata } from 'next'
import { Bebas_Neue, Outfit } from 'next/font/google'
import './globals.css'

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
})

const bebasNeue = Bebas_Neue({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-bebas',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Photogenics — Softfile',
  description: 'Download hasil foto kamu dari Photogenics.',
  robots: 'noindex, nofollow',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <body className={`${outfit.variable} ${bebasNeue.variable}`}>
        {children}
      </body>
    </html>
  )
}