import React from 'react'
import Image from 'next/image'
import TableHeader from './TableHeader'

export default function LoadingView() {
  return (
    <div className="w-full h-full bg-white">
      <TableHeader />
      <div className="w-full h-[calc(100%-40px)] flex items-center justify-center">
        <div className="w-[40px] h-[64px] relative">
          <Image
            src="/icons/loading.png"
            alt="Loading"
            fill
            className="object-contain"
            unoptimized
          />
        </div>
      </div>
    </div>
  )
} 