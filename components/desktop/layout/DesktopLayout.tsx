import React from 'react'
import Navbar from '../Navbar'
import MainWindow from '../MainWindow'
import SideIcons from '../SideIcons'
import Footer from '../Footer'
import RecentRecycled from '@/components/shared/RecentRecycled'

export default function DesktopLayout() {
  return (
    <div className="flex flex-col h-screen bg-[#0A0A0A]">
      <div className="shrink-0">
        <Navbar />
        <RecentRecycled />
      </div>
      
      <div className="flex-1 relative overflow-hidden flex flex-col">
        <div className="absolute left-0 top-0 bottom-0 w-[100px]">
          <SideIcons />
        </div>
        
        <div className="flex-1 flex items-center justify-center pb-4">
          <div className="h-[calc(100%-2rem)] w-[450px]">
            <MainWindow />
          </div>
        </div>
      </div>

      <div className="shrink-0 mt-auto">
        <Footer />
      </div>
    </div>
  )
} 