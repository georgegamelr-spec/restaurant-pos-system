import type { Metadata } from 'next'
import './globals.css'

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Restaurant POS System',
  description: 'Complete POS system for restaurants and cafes',
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
