import React, { useState, useRef } from 'react'
import Image from 'next/image'
import { Token, TokenDescription } from '@/types/token'
import { getTokenFallbackImage } from '@/constants/tokenImages'
import { formatAmount } from '@/utils/formatNumber'
import { calculateTokenPoints } from '@/utils/calculatePoints'
import RecycleHoverCard from './RecycleHoverCard'

interface TokenItemProps {
  token: Token
  index: number
  isMobile: boolean
  onRecycle: (tokens: Token[]) => void
}

export default function TokenItem({ token, index, isMobile, onRecycle }: TokenItemProps) {
  const [showHoverCard, setShowHoverCard] = useState(false)
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 })
  const itemRef = useRef<HTMLDivElement>(null)

  const handleMouseEnter = (e: React.MouseEvent) => {
    setHoverPosition({
      x: e.clientX,
      y: e.clientY
    })
    setShowHoverCard(true)
  }

  const handleRecycleClick = () => {
    setShowHoverCard(false)
    onRecycle([token])
  }

  const getImageSource = () => {
    const predefinedImage = getTokenFallbackImage(token.id)
    return predefinedImage || token.imageUri || "/images/default-token-list.png"
  }

  const isSpecialToken = Number(token.multiplier) > 1
  const points = calculateTokenPoints(token)

  if (isMobile) {
    return (
      <div className="flex w-full h-[64px] border-b border-[#DFDFDF] bg-white">
        {/* Name + Amount */}
        <div className="w-[200px] h-full border-r border-[#DFDFDF] flex items-center px-4 gap-3">
          <div className="w-[28px] h-[28px] relative">
            <Image
              src={getImageSource()}
              alt={token.symbol}
              fill
              className="object-contain"
              unoptimized
            />
          </div>
          <div className="flex flex-col">
            <span className="font-ms-sans text-[14px] text-[#0A0A0A]">
              ${token.symbol}
            </span>
            <span className="font-ms-sans text-[12px] text-[#0A0A0A]">
              ({formatAmount(Number(token.amount))})
            </span>
          </div>
        </div>

        {/* Description */}
        <div className="w-[130px] h-full border-r border-[#DFDFDF] flex items-center justify-center">
          <span className={`font-ms-sans text-[14px] text-center ${
            isSpecialToken
            ? 'text-[#7F3DF0]'
            : 'text-[#0A0A0A]'
          }`}>
            {token.description}
          </span>
        </div>

        {/* Recycle Button */}
        <div className="flex-1 h-full flex items-center justify-center">
          <button
            onClick={() => onRecycle([token])}
          >
            <Image
              src="/icons/mobile-recycle.png"
              alt="Recycle"
              width={38}
              height={38}
              className="object-contain"
            />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div 
      ref={itemRef}
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setShowHoverCard(false)}
    >
      {showHoverCard && (
        <RecycleHoverCard 
          points={points} 
          position={hoverPosition}
          onRecycle={handleRecycleClick}
        />
      )}
      
      <div className="group flex w-full h-[64px] border-b border-[#DFDFDF] bg-white hover:bg-[#333096]">
        {/* Name - 좌측 정렬 */}
        <div className={`${isMobile ? 'w-[120px]' : 'w-[230px]'} h-full border-r border-[#DFDFDF] flex items-center px-4 gap-3`}>
          <div className="w-[40px] h-[40px] relative">
            <Image
              src={getImageSource()}
              alt={token.symbol}
              fill
              className="object-contain"
              unoptimized
            />
          </div>
          <span className="font-ms-sans text-[16px] leading-[34px] truncate text-[#0A0A0A] group-hover:text-white">
            ${token.symbol}
          </span>
        </div>

        {/* Amount - 우측 정렬 */}
        <div className={`${isMobile ? 'w-[100px]' : 'w-[150px]'} h-full border-r border-[#DFDFDF] flex items-center justify-end px-4`}>
          <span className="font-ms-sans text-[16px] leading-[34px] text-[#0A0A0A] group-hover:text-white">
            {formatAmount(Number(token.amount))}
          </span>
        </div>

        {/* Description - 중앙 정렬 */}
        <div className={`${isMobile ? 'w-[120px]' : 'w-[180px]'} h-full border-r border-[#DFDFDF] flex items-center justify-center px-4`}>
          <span className={`font-ms-sans text-[16px] leading-[34px] truncate text-center ${
            isSpecialToken
            ? 'text-[#7F3DF0] group-hover:text-[#FFF200]'
            : 'text-[#0A0A0A] group-hover:text-white'
          }`}>
            {token.description}
          </span>
        </div>

        {/* Points - 좌측 정렬 */}
        <div className={`${isMobile ? 'w-[100px]' : 'w-[172px]'} h-full flex items-center justify-start px-4`}>
          <span className="font-ms-sans text-[16px] leading-[34px] text-[#0A0A0A] group-hover:text-white">
            {points}
          </span>
        </div>
      </div>
    </div>
  )
} 