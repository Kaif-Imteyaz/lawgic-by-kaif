import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://lawgic.vercel.app'), 
  title: 'Lawgic – Your Legal AI Assistant',
  description: 'Lawgic uses AI to summarize legal documents, predict judgments, and identify relevant statutes for smarter legal help.',
  generator: 'Kaif Imteyaz',
  keywords: ['AI', 'Legal AI', 'Lawgic', 'Legal Assistant', 'Document Summarization', 'Judgment Prediction', 'Statute Identification'],
  authors: [{ name: 'Kaif Imteyaz' }],
  creator: 'Kaif Imteyaz',
  openGraph: {
    title: 'Lawgic – Your Legal AI Assistant',
    description: 'Lawgic uses AI to summarize legal documents, predict judgments, and identify relevant statutes for smarter legal help.',
    url: 'https:', // Updated URL
    siteName: 'Lawgic',
    images: [
      {
        url: '/android-chrome-512x512.png',
        width: 512,
        height: 512,
      },
    ],
  },
  robots: 'index, follow',
  appleWebApp: {
    title: 'Lawgic – Your Legal AI Assistant',
    statusBarStyle: 'default',
    capable: true,
  },
  manifest: '/site.webmanifest',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
