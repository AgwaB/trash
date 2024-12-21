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
      
      <div className="flex-1 relative overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-[100px]">
          <SideIcons />
        </div>
        
        <div className="
          h-full
          flex items-center justify-center
          px-4
        ">
          <div className="
            w-[450px]
            sm:w-[calc(100%-32px)]
            sm:max-w-[450px]
          ">
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