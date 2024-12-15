"use client"
import { useState, useEffect } from 'react'
import { fetchUserStats } from '@/services/contract'

export function useUserStats(address: string | undefined) {
  const [userStats, setUserStats] = useState({
    recycleCount: '0',
    totalSolReceived: '0',
    totalPointsEarned: '0',
    lastUpdated: '0'
  })

  useEffect(() => {
    const getUserStats = async () => {
      if (!address) return
      const stats = await fetchUserStats(address)
      setUserStats(stats)
    }

    getUserStats()
  }, [address])

  return userStats
} 