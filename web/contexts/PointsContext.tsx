"use client"
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { fetchUserStats } from '@/services/contract'

interface PointsContextType {
  points: string
  refreshPoints: () => Promise<void>
}

const PointsContext = createContext<PointsContextType>({
  points: "0",
  refreshPoints: async () => {}
})

export function PointsProvider({ children }: { children: React.ReactNode }) {
  const { connected, publicKey } = useWallet()
  const [points, setPoints] = useState("0")

  const refreshPoints = useCallback(async () => {
    if (!connected || !publicKey) {
      setPoints("0")
      return
    }
    try {
      const stats = await fetchUserStats(publicKey.toString())
      setPoints(stats.totalPointsEarned)
    } catch (error) {
      console.error('Failed to refresh points:', error)
    }
  }, [connected, publicKey])

  useEffect(() => {
    refreshPoints()
  }, [refreshPoints])

  return (
    <PointsContext.Provider value={{ 
      points,
      refreshPoints
    }}>
      {children}
    </PointsContext.Provider>
  )
}

export const usePoints = () => useContext(PointsContext) 