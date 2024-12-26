import React, { useEffect } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface ToastProps {
  message: string
  type: 'success' | 'error'
  onClose: () => void
  isMobile?: boolean
}

export default function Toast({ message, type, onClose, isMobile = false }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, 3000)

    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div className={cn(
      "fixed z-50",
      isMobile 
        ? "w-[214px] h-[80px] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        : "w-[360px] h-[65px] top-[100px] right-4 bg-[#504DD7] bg-opacity-70"
    )}>
      <div className={cn(
        "flex items-center justify-center gap-3 bg-[#13121F]",
        isMobile ? "w-full h-full px-[30px] py-[23px]" : "px-[30px] py-[23px]"
      )}>
        <div className="w-5 h-5 relative">
          <Image
            src={type === 'success' ? "/icons/success.png" : "/icons/error.png"}
            alt={type === 'success' ? "Success" : "Error"}
            fill
            className="object-contain"
          />
        </div>
        <span className={cn(
          "font-ms-sans text-[14px]",
          isMobile ? "text-[#DFDFDF]" : "text-[#DFDFDF]"
        )}>
          {message}
        </span>
      </div>
    </div>
  )
} 