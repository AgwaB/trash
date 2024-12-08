"use client"
import React, { useEffect, useState } from 'react'
import { fetchRecentRecycled } from '@/services/token'

export default function RecentRecycled() {
  const [recent, setRecent] = useState({
    amount: 0,
    symbol: "$WIF"
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchRecentRecycled()
        setRecent(data)
      } catch (error) {
        console.error('Failed to fetch recent recycled:', error)
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="h-[60px] bg-[#26243B] border-b border-[#1A1828] flex items-center justify-center">
      <span className="font-ms-sans text-[14px] text-[#FFBF57]">
        SSCAJS Recycled {recent.amount.toLocaleString()} {recent.symbol}
      </span>
    </div>
  )
} 