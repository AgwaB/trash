import React from 'react'
import MobileNavbar from '../MobileNavbar'
import MobileMainWindow from '../MobileMainWindow'
import RecentRecycled from '@/components/shared/RecentRecycled'

export default function MobileLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-[#0A0A0A]">
      <div className="shrink-0">
        <MobileNavbar />
        <RecentRecycled />
      </div>
      
      <div className="h-[calc(100vh-140px)]">
        <MobileMainWindow />
      </div>
    </div>
  )
} 