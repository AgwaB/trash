import React from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface HowItWorksModalProps {
  isOpen: boolean
  onClose: () => void
  isMobile?: boolean
}

export default function HowItWorksModal({ isOpen, onClose, isMobile = false }: HowItWorksModalProps) {
  if (!isOpen) return null

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50" onClick={handleBackdropClick}>
      <div className="w-[734px] h-[496px] bg-[#AA9ECA] shadow-[inset_2px_2px_2px_#CCC0F8,inset_1px_1px_1px_#FFFFFF,inset_-3px_-3px_3px_#776EBA]">
        {/* Title Bar */}
        <div className="mx-[4px] mt-[3px] h-[36px] bg-[#504DA7] flex items-center px-2">
          <div className={cn(
            "font-ms-sans text-[14px] font-[700] text-[#FEFEFE]",
            isMobile ? "flex-1 text-center" : "flex-1"
          )}>
            How it works
          </div>
          {!isMobile && (
            <button
              onClick={onClose}
              className="w-[29px] h-[29px] bg-[#AA9ECA] flex items-center justify-center
                        border border-white border-t-2 border-l-2
                        shadow-[inset_-2px_-2px_0px_rgba(0,0,0,0.25)]
                        hover:bg-[#9084B3] 
                        active:border-b-2 active:border-r-2 active:border-t-0 active:border-l-0 
                        active:shadow-[inset_2px_2px_0px_rgba(0,0,0,0.25)]"
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
          )}
        </div>

        {/* Content Area */}
        <div className="mx-[2px] mt-[3px] bg-white h-[447px] shadow-[inset_2px_2px_2px_#CCC0F8,inset_1px_1px_1px_#FFFFFF,inset_-3px_-3px_3px_#776EBA] relative">
          <div className="p-8">
            <p className="text-[#0A0A0A] font-ms-sans text-[14px] leading-relaxed">
              <p className="font-[700]">Trash your rugged (or yet to be rugged) Solana memecoins to receive points.</p>
              <br /><br />
              1. Select the useless tokens you want to get rid off.
              <br /><br />
              2. Receive points (Get bonus points for vaporware utility tokens and trash-cult memes).
              <br /><br />
              3. Keep trashing and wait for airdrop!
            </p>
          </div>

          {/* Mobile Close Button */}
          {isMobile && (
            <div className="absolute bottom-8 inset-x-0 flex justify-center">
              <button
                onClick={onClose}
                className="relative w-[240px] h-[50px] flex items-center justify-center"
              >
                <Image
                  src="/images/recycle.png"
                  alt="Close Button"
                  width={240}
                  height={50}
                  className="object-contain"
                />
                <span className="absolute inset-0 flex items-center justify-center 
                              font-ms-sans text-[16px] text-white">
                  Close
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 