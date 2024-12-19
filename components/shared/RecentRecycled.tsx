"use client"
import React from 'react'
import Image from 'next/image'
import { useRecentRecycles } from '@/hooks/useRecentRecycles'
import { getTokenFallbackImage } from '@/constants/tokenImages'
import styles from './RecentRecycled.module.css'
import { formatWithCommas } from '@/utils/formatNumber'

export default function RecentRecycled() {
  const { recentRecycle, isLoading, shouldHighlight } = useRecentRecycles()

  if (isLoading) {
    return (
      <div className="h-[40px] bg-[#26243B] border-b border-[#1A1828] flex items-center justify-center">
        <span className="font-ms-sans text-[14px] text-[#FFBF57]">
          Loading...
        </span>
      </div>
    )
  }

  if (!recentRecycle) {
    return (
      <div className="h-[40px] bg-[#26243B] border-b border-[#1A1828] flex items-center justify-center">
        <span className="font-ms-sans text-[14px] text-[#FFBF57]">
          No recent activity
        </span>
      </div>
    )
  }

  const getImageSource = () => {
    const predefinedImage = getTokenFallbackImage(recentRecycle.mint)
    if (predefinedImage) {
      return predefinedImage
    }
    return recentRecycle.imageUri || "/images/default-token-recent.png"
  }

  return (
    <div className="h-[40px] bg-[#26243B] border-b border-[#1A1828] flex items-center justify-center gap-2">
      <div className="w-6 h-6 relative">
        <Image
          src={getImageSource()}
          alt={recentRecycle.symbol}
          fill
          className="object-contain"
          unoptimized
        />
      </div>
      <span className={`font-ms-sans text-[14px] text-[#FFBF57] ${shouldHighlight ? styles.highlight : ''}`}>
        {recentRecycle.name} Recycled {formatWithCommas(recentRecycle.amount)} ${recentRecycle.symbol}
      </span>
    </div>
  )
} 