import React from 'react'
import type { Metadata } from "next"
import "./globals.css"
import { WalletProviders } from '@/providers/WalletProvider'
import { PointsProvider } from '@/contexts/PointsContext'
import { Toaster } from "@/components/ui/toaster"

export const metadata: Metadata = {
  title: "Trash.meme",
  description: "Now I Am Become trash.meme, the Destroyer of Solana Memes.",
  openGraph: {
    title: 'Trash.meme',
    description: 'Now I Am Become trash.meme, the Destroyer of Solana Memes.',
    url: 'https://www.trash.meme/',
    siteName: 'Trash.meme',
    images: [
      {
        url: '/thumbnail.png',
        width: 1200,
        height: 630,
        alt: 'Trash.meme Preview',
      },
    ],
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Trash.meme',
    description: 'Now I Am Become trash.meme, the Destroyer of Solana Memes.',
    images: ['/thumbnail.png'],
  },
  icons: {
    icon: '/favicon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="bg-[#504DD7]">
      <head>
        <link rel="icon" href="/favicon.png" sizes="any" />
      </head>
      <body className="bg-[#504DD7]">
        <WalletProviders>
          <PointsProvider>
            {children}
            <Toaster />
          </PointsProvider>
        </WalletProviders>
      </body>
    </html>
  )
}
