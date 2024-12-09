import React from 'react'
import Image from 'next/image'
import { Token, TokenDescription } from '@/types/token'
import { getTokenFallbackImage as getPredefinedTokenImage } from '@/constants/tokenImages'

interface TokenItemProps {
  token: Token
  index: number
  onSelect: (tokenId: string) => void
  isSelected: boolean
}

export default function TokenItem({ token, index, onSelect, isSelected }: TokenItemProps) {
  const isShinyTrash = token.description === TokenDescription.SHINY_TRASH
  
  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onSelect(token.id)
  }
  
  // 이미지 소스 결정 로직
  const getImageSource = () => {
    const predefinedImage = getPredefinedTokenImage(token.id)
    if (predefinedImage) {
      return predefinedImage
    }

    if (token.imageUri) {
      return token.imageUri
    }
    
    return "/images/default-token.png"
  }
  
  return (
    <div className={`flex w-full h-[80px] border-b border-[#DFDFDF] ${isSelected ? 'bg-[#333096]' : 'bg-white hover:bg-[#333096]'} group cursor-pointer`}>
      {/* Index */}
      <div className="w-[58px] h-full border-r border-[#DFDFDF] flex items-center justify-center">
        <span className={`font-ms-sans text-[16px] leading-[34px] ${isSelected ? 'text-[#FEFEFE]' : 'text-[#0A0A0A] group-hover:text-[#FEFEFE]'}`}>
          {index + 1}
        </span>
      </div>

      {/* Name */}
      <div className="w-[310px] h-full border-r border-[#DFDFDF] flex items-center px-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 relative">
            <Image
              src={getImageSource()}
              alt={token.name || 'Token Image'}
              fill
              className="object-contain"
              unoptimized
            />
          </div>
          <span className={`font-ms-sans text-[16px] leading-[34px] ${isSelected ? 'text-[#FEFEFE]' : 'text-[#0A0A0A] group-hover:text-[#FEFEFE]'}`}>
            {`$${token.symbol}(${token.amount})`}
          </span>
        </div>
      </div>

      {/* Description */}
      <div className="w-[144px] h-full border-r border-[#DFDFDF] flex items-center px-6">
        <span className={`font-ms-sans text-[16px] leading-[34px] ${
          isShinyTrash 
            ? `text-[#7F3DF0] ${isSelected ? 'text-[#FFF200]' : 'group-hover:text-[#FFF200]'}`
            : `text-[#0A0A0A] ${isSelected ? 'text-[#FEFEFE]' : 'group-hover:text-[#FEFEFE]'}`
        }`}>
          {token.description}
        </span>
      </div>

      {/* Action */}
      <div className="w-[95px] h-full flex items-center justify-center">
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