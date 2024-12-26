import React, { useState } from 'react'
import Image from 'next/image'
import { createPortal } from 'react-dom'

interface RecycleHoverCardProps {
  points: string
  position: { x: number, y: number }
  onRecycle: () => void
}

export default function RecycleHoverCard({ points, position, onRecycle }: RecycleHoverCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  if (typeof window === 'undefined') return null

  return createPortal(
    <div 
      style={{
        position: 'fixed',
        left: `${position.x + 16}px`,
        top: `${position.y + 16}px`,
        zIndex: 9999,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onRecycle}
      className="cursor-pointer"
    >
      <div className={`
        w-[208px] bg-[#CDBEF8] 
        border-2 border-[#7775BA]
        relative
        before:absolute before:content-[''] before:inset-0
        before:border-t-[#CDBEF8] before:border-l-[#CDBEF8]
        before:border-t-2 before:border-l-2
        before:pointer-events-none
        after:absolute after:content-[''] after:inset-0
        after:border-r-[#AA9EC9] after:border-b-[#AA9EC9]
        after:border-r-4 after:border-b-4
        after:pointer-events-none
        ${isHovered ? 'bg-[#7775BA]' : ''}
      `}>
        {/* Header */}
        <div className={`
          flex items-center gap-2 px-4 py-2 border-b-2 border-[#AA9ECA]
          ${isHovered ? 'bg-[#333096]' : ''}
        `}>
          <div className="w-4 h-4 relative">
            <Image
              src={isHovered ? "/icons/hover-trash2.png" : "/icons/hover-trash.png"}
              alt="Recycle"
              fill
              className="object-contain"
            />
          </div>
          <span className={`font-ms-sans text-[14px] font-bold ${isHovered ? 'text-white' : 'text-black'}`}>
            Recycle
          </span>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className={`font-ms-sans font-bold text-[14px] ${isHovered ? 'text-white' : 'text-[#7775BA]'}`}>
            Recycle for Points:
          </div>
          <div className={`font-ms-sans font-bold text-[14px] ${isHovered ? 'text-white' : 'text-black'}`}>
            {points}
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
} 