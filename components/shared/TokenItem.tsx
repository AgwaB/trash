import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { Token, TokenDescription } from '@/types/token'
import { getTokenFallbackImage as getPredefinedTokenImage } from '@/constants/tokenImages'
import { formatAmount } from '@/utils/formatNumber'

interface TokenItemProps {
  token: Token
  index: number
  onSelect: (tokenId: string) => void
  isSelected: boolean
  isMobile: boolean
}

export default function TokenItem({ token, index, onSelect, isSelected, isMobile }: TokenItemProps) {
  const [imageError, setImageError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  
  const isShinyTrash = token.description === TokenDescription.SHINY_TRASH
  
  // 이미지 로딩 타임아웃 처리
  useEffect(() => {
    if (!token.imageUri) return

    const timeoutId = setTimeout(() => {
      if (isLoading) {
        setImageError(true)
        setIsLoading(false)
      }
    }, 10000)

    return () => clearTimeout(timeoutId)
  }, [token.imageUri, isLoading])
  
  const handleClick = () => {
    onSelect(token.id)
  }
  
  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onSelect(token.id)
  }
  
  // 이미지 소스 결정 로직
  const getImageSource = () => {
    if (imageError) {
      return "/images/default-token-list.png"
    }

    const predefinedImage = getPredefinedTokenImage(token.id)
    if (predefinedImage) {
      return predefinedImage
    }

    return token.imageUri || "/images/default-token-list.png"
  }

  return (
    <div 
      className={`flex w-full h-[80px] border-b border-[#DFDFDF] ${isSelected ? 'bg-[#333096]' : 'bg-white hover:bg-[#333096]'} group cursor-pointer`}
      onClick={handleClick}
    >
      {/* Index */}
      <div className={`${isMobile ? 'w-[40px]' : 'w-[58px]'} h-full border-r border-[#DFDFDF] flex items-center justify-center`}>
        <span className={`font-ms-sans text-[16px] leading-[34px] ${isSelected ? 'text-[#FEFEFE]' : 'text-[#0A0A0A] group-hover:text-[#FEFEFE]'}`}>
          {index + 1}
        </span>
      </div>

      {/* Name */}
      <div className={`${isMobile ? 'w-[215px]' : 'w-[310px]'} h-full border-r border-[#DFDFDF] flex items-center px-4`}>
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 relative flex-shrink-0">
            <Image
              src={getImageSource()}
              alt={token.name}
              width={32}
              height={32}
              className="object-contain"
              onError={() => {
                setImageError(true)
                setIsLoading(false)
              }}
              onLoadingComplete={() => setIsLoading(false)}
              priority={index < 10}
            />
            {isLoading && !imageError && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                {/* 로딩 인디케이터 (선택사항) */}
              </div>
            )}
          </div>
          <div className="flex flex-col">
            <span className={`font-ms-sans text-[16px] leading-[20px] truncate ${
              isSelected ? 'text-[#FEFEFE]' : 'text-[#0A0A0A] group-hover:text-[#FEFEFE]'
            }`}>
              ${token.symbol}
            </span>
            <span className={`font-ms-sans text-[14px] leading-[18px] truncate ${
              isSelected ? 'text-[#FEFEFE]' : 'text-[#0A0A0A] group-hover:text-[#FEFEFE]'
            }`}>
              ({formatAmount(Number(token.amount))})
            </span>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className={`${isMobile ? 'w-[113px]' : 'w-[160px]'} h-full border-r border-[#DFDFDF] flex items-center justify-center px-2`}>
        <span className={`font-ms-sans text-[16px] leading-[34px] truncate text-center ${
          isShinyTrash 
            ? `text-[#7F3DF0] ${isSelected ? 'text-[#FFF200]' : 'group-hover:text-[#FFF200]'}`
            : `text-[#0A0A0A] ${isSelected ? 'text-[#FEFEFE]' : 'group-hover:text-[#FEFEFE]'}`
        }`}>
          {token.description}
        </span>
      </div>

      {/* Action */}
      <div className={`${isMobile ? 'w-[50px]' : 'w-[95px]'} h-full flex items-center justify-center`}>
        <button
          onClick={handleCheckboxClick}
          className="w-[16px] h-[16px] bg-white border-none relative shadow-[inset_-1px_-1px_0px_#FFF,inset_1px_1px_0px_#808080,inset_-2px_-2px_0px_#C1C1C1,inset_2px_2px_0px_#000]"
        >
          {isSelected && (
            <div className="absolute inset-0 m-[2px]">
              <Image
                src="/icons/check.png"
                alt="Checked"
                width={12}
                height={12}
                className="w-full h-full"
                unoptimized
              />
            </div>
          )}
        </button>
      </div>
    </div>
  )
} 