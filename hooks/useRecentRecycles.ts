"use client"
import { useState, useEffect, useRef } from 'react'
import { fetchRecentRecycles } from '@/services/contract'
import { fetchToken } from '@/services/token'
import { PublicKey } from '@solana/web3.js'
import { BN } from '@coral-xyz/anchor'

interface RecentRecycleWithMetadata {
  amount: number
  symbol: string
  name: string
  imageUri?: string
  mint: string
}

export function useRecentRecycles() {
  const [recentRecycle, setRecentRecycle] = useState<RecentRecycleWithMetadata | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [shouldHighlight, setShouldHighlight] = useState(false)
  const prevRecycleRef = useRef<RecentRecycleWithMetadata | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const setHighlight = (value: boolean) => {
    setShouldHighlight(value)
    console.log(value ? "turn on" : "turn off")
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch the most recent recycle
        const recycles = await fetchRecentRecycles(1)
        if (recycles.length === 0) {
          setIsLoading(false)
          return
        }

        const latestRecycle = recycles[0]
        const token = await fetchToken(latestRecycle.tokenMint)

        if (!token) {
          console.error("Token not found")
          return
        }
        console.log(`token: ${JSON.stringify(token)}`)

        // decimal을 고려하여 amount 계산
        const rawAmount = new BN(latestRecycle.tokenAmount)
        const decimals = new BN(token.decimals || 0)
        const divisor = new BN(10).pow(decimals)
        const amount = rawAmount.div(divisor).toNumber() + 
          (rawAmount.mod(divisor).toNumber() / Math.pow(10, decimals.toNumber()))

        const newRecycle = {
          amount,
          symbol: token.symbol,
          name: token.name,
          imageUri: token.imageUri,
          mint: latestRecycle.tokenMint
        }

        if (!prevRecycleRef.current || 
            prevRecycleRef.current.symbol !== newRecycle.symbol || 
            prevRecycleRef.current.amount !== newRecycle.amount) {
          // 이전 타이머가 있다면 클리어
          if (timerRef.current) {
            clearTimeout(timerRef.current)
          }
          
          // 즉시 하이라이트 켜기
          setHighlight(true)
          
          // 1.5초 후에 끄기
          timerRef.current = setTimeout(() => {
            setHighlight(false)
          }, 1500)
        }
        
        prevRecycleRef.current = newRecycle
        setRecentRecycle(newRecycle)
      } catch (error) {
        console.error('Failed to fetch recycle data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    // 초기 데이터 로드
    fetchData()

    // 5초마다 폴링
    const interval = setInterval(fetchData, 5000)

    return () => {
      clearInterval(interval)
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [])

  return { recentRecycle, isLoading, shouldHighlight }
} 