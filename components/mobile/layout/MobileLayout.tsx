import React from 'react'
import MobileNavbar from '../MobileNavbar'
import MobileMainWindow from '../MobileMainWindow'
import RecentRecycled from '@/components/shared/RecentRecycled'

export default function MobileLayout() {
  return (
    <div className="flex flex-col h-screen bg-[#0A0A0A] w-full">
      <MobileNavbar />
      <RecentRecycled />
      <div className="flex-1">
        <MobileMainWindow />
      </div>
    </div>
  )
} 