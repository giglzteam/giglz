import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Giglz — The #1 Party Game for Students & House Parties',
  description: 'No App Store. No Downloads. Click & Play. 200+ cards, 6 challenges. The party game designed to break the ice in under 8 minutes.',
  keywords: ['party game', 'drinking game', 'student game', 'house party game', 'flatmate game'],
  manifest: '/manifest.json',
  openGraph: {
    title: 'Giglz — Turn Any Party Unforgettable',
    description: 'Click & play party game. No downloads. Works on any phone.',
    url: 'https://giglz.org',
    siteName: 'Giglz',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Giglz — Turn Any Party Unforgettable',
    description: 'Click & play party game. No downloads. Works on any phone.',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Giglz',
  },
}

export const viewport: Viewport = {
  themeColor: '#7ADDDA',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
