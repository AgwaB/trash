"use client"
import React, { useEffect, useState } from 'react'
import { fetchRecentRecycled } from '@/services/token'

export default function RecentRecycled() {
  const [recent, setRecent] = useState({
    amount: 0,
    symbol: "$WIF"
  })
  const [prevAmount, setPrevAmount] = useState(0)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchRecentRecycled()
        if (data.amount !== recent.amount) {
          setPrevAmount(recent.amount)
          setRecent(data)
        }
      } catch (error) {
        console.error('Failed to fetch recent recycled:', error)
      }
    }

    // 초기 데이터 로드
    fetchData()

    // 5초마다 폴링
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