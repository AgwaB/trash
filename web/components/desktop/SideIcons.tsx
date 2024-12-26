import React from 'react'
import Image from 'next/image'

export default function SideIcons() {
  const handleXClick = () => {
    window.open('https://x.com/', '_blank')
  }

  return (
    <div className="flex flex-col items-center gap-10 pt-[56px]">
      <div 
        className="flex flex-col items-center gap-1 cursor-pointer hover:opacity-80"
        onClick={handleXClick}
      >
        <div className="w-[48px] h-[48px] relative">
          <Image
            src="/icons/x.png"
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
    </div>
  )
} 