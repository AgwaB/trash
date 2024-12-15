"use client"
import { useState, useEffect } from 'react'
import { fetchRecentRecycles } from '@/services/contract'
import { fetchToken } from '@/services/token'

interface RecentRecycleWithMetadata {
  amount: number
  symbol: string
  imageUri?: string
  mint: string
}

export function useRecentRecycles() {
  const [recentRecycle, setRecentRecycle] = useState<RecentRecycleWithMetadata | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const recycles = await fetchRecentRecycles(1)
        if (recycles[0]) {
          const tokenMint = recycles[0].tokenMint
          const amount = Number(recycles[0].tokenAmount)

          // 개별 토큰 정보 조회
          const token = await fetchToken(tokenMint)

          setRecentRecycle({
            amount,
            symbol: token?.symbol || 'Unknown',
            imageUri: token?.imageUri,
            mint: tokenMint
          })
        }
      } catch (error) {
        console.error('Failed to fetch recent recycled:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 5000)
    return () => clearInterval(interval)
  }, [])

  return { recentRecycle, isLoading }
} 