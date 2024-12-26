import React from 'react'
import Image from 'next/image'

export default function EmptyView() {
  return (
    <div className="w-full h-full bg-white flex flex-col items-center justify-center">
      <div className="relative w-[100px] h-[126px] mb-6">
        <Image
          src="/images/character-gray.png"
          alt="Empty State"
          fill
          className="object-contain opacity-50"
          unoptimized
        />
      </div>
      <span className="font-ms-sans text-[16px] text-[#848584]">Empty</span>
    </div>
  )
} 