import React from 'react'
import type { Metadata } from "next"
import "./globals.css"
import { WalletProviders } from '@/providers/WalletProvider'
import { PointsProvider } from '@/contexts/PointsContext'
import { Toaster } from "@/components/ui/toaster"

export const metadata: Metadata = {
  title: "Trash.meme",
  description: "Recycle your worthless tokens",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="bg-[#504DD7]">
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
