"use client"
import React, { createContext, useContext, useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { fetchUserStats } from '@/services/contract'

interface PointsContextType {
  points: string
  refreshPoints: () => Promise<void>
}

const PointsContext = createContext<PointsContextType>({
  points: "0.00",
  refreshPoints: async () => {}
})

export function PointsProvider({ children }: { children: React.ReactNode }) {
  const { connected, publicKey } = useWallet()
  const [points, setPoints] = useState("0.00")

  const refreshPoints = async () => {
    if (connected && publicKey) {
      try {
        const userStats = await fetchUserStats(publicKey.toString())
        setPoints(userStats.totalPointsEarned.toLocaleString())
      } catch (error) {
        console.error('Failed to fetch points:', error)
        setPoints("0.00")
      }
    } else {
      setPoints("0.00")
    }
  }

  useEffect(() => {
    refreshPoints()
  }, [connected, publicKey])

  return (
    <PointsContext.Provider value={{ points, refreshPoints }}>
      {children}
    </PointsContext.Provider>
  )
}

export const usePoints = () => useContext(PointsContext) 