"use client"
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
import React from 'react'
import DesktopLayout from '@/components/desktop/layout/DesktopLayout'
import MobileLayout from '@/components/mobile/layout/MobileLayout'

export default function Home() {
  return (
    <>
      <div className="hidden md:block">
        <DesktopLayout />
      </div>
      <div className="block md:hidden">
        <MobileLayout />
      </div>
    </>
  )
}
