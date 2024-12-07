"use client"
import React, { useEffect, useState } from 'react'
import { fetchTotalRecycled } from '@/services/token'

export default function TotalRecycled() {
  const [total, setTotal] = useState({
    amount: 0,
    symbol: "$WIF"
  })
  const [prevAmount, setPrevAmount] = useState(0)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchTotalRecycled()
        if (data.amount !== total.amount) {
          setPrevAmount(total.amount)
          setTotal(data)
          // TODO: 값이 변경되었을 때 이펙트 추가
        }
      } catch (error) {
        console.error('Failed to fetch total recycled:', error)
      }
    }

    // 초기 데이터 로드
    fetchData()

    // 5초마다 폴링
    const interval = setInterval(fetchData, 5000)

    return () => clearInterval(interval)
  }, [total.amount])

  return (
    <div className="w-full bg-[#504DD7] py-2 text-center">
      <span className="font-ms-sans text-[14px] text-[#FEFEFE]">
        SSCAJS Recycled {total.amount.toLocaleString()} {total.symbol}
      </span>
    </div>
  )
} 