import React from 'react'
import Image from 'next/image'

export default function SideIcons() {
  return (
    <div className="flex flex-col items-center gap-8 pt-8">
      <div className="flex flex-col items-center gap-1">
        <div className="w-[48px] h-[48px] relative">
          <Image
            src="/icons/trash-logo.png"
            alt="Trash.meme"
            fill
            className="object-contain"
          />
        </div>
        <span className="text-white font-ms-sans text-[12px]">Trash.meme</span>
      </div>

      <div className="flex flex-col items-center gap-1">
        <div className="w-[48px] h-[48px] relative">
          <Image
            src="/icons/folder.png"
            alt="Airdrop"
            fill
            className="object-contain"
          />
        </div>
        <span className="text-white font-ms-sans text-[12px]">Airdrop</span>
      </div>

      <div className="flex flex-col items-center gap-1">
        <div className="w-[48px] h-[48px] relative">
          <Image
            src="/icons/trash-points.png"
            alt="Trash Point"
            fill
            className="object-contain"
          />
        </div>
        <span className="text-white font-ms-sans text-[12px]">Trash Point</span>
      </div>
    </div>
  )
} 