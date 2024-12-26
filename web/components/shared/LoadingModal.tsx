import React from 'react'
import Image from 'next/image'

interface LoadingModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function LoadingModal({ isOpen, onClose }: LoadingModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-50" />
      
      {/* Modal */}
      <div className="relative bg-[#AA9ECA] w-[664px] h-[384px] flex flex-col">
        {/* Inner shadows */}
        <div className="absolute inset-0 border-2 border-[#CCC0F8]" />
        <div className="absolute inset-[2px] border border-white" />
        <div className="absolute inset-[3px] border border-[#776EBA]" />

        {/* Title bar */}
        <div className="h-[36px] bg-[#503D9E] px-1.5 py-1.5 flex justify-between items-center pl-2">
          <span className="text-white font-ms-sans">Deleting...</span>
          <button 
            onClick={onClose}
            className="w-[29px] h-[29px] bg-[#AA9ECA] flex items-center justify-center
                     border border-white border-t-2 border-l-2
                     shadow-[inset_-2px_-2px_0px_rgba(0,0,0,0.25)]
                     hover:active:border-b-2 hover:active:border-r-2 
                     hover:active:border-t-0 hover:active:border-l-0 
                     hover:active:shadow-[inset_2px_2px_0px_rgba(0,0,0,0.25)]"
          >
            <div className="w-4 h-4 relative">
              <Image
                src="/icons/close.png"
                alt="Close"
                fill
                className="object-contain"
              />
            </div>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col items-center justify-center pb-12">
          {/* Character */}
          <div className="w-[250px] h-[250px] relative mb-4">
            <Image
              src="/images/character.gif"
              alt="Deleting"
              fill
              className="object-contain"
              unoptimized
            />
          </div>

          {/* Progress bar container */}
          <div className="w-[497px] h-[26px] bg-[#AA9ECA] relative
           border-2 border-t-[#776EBA] border-l-[#776EBA]
           border-r-[#D8D0F0] border-b-[#D8D0F0]">

            {/* Progress bar segments container */}
            <div className="absolute inset-[2px] flex gap-[1px]">
              {Array.from({ length: 40 }).map((_, i) => (
                <div
                  key={i}
                  className="w-[12px] h-[18px] bg-[#1616EB] relative
                    border-2 border-t-[#3C42FF] border-l-[#3C42FF]
                           border-r-[#1111AA] border-b-[#1111AA]">
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 