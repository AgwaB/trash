"use client"
import React, { createContext, useContext, useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { fetchPoints } from '@/services/token'

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
        const newPoints = await fetchPoints(publicKey.toString())
        setPoints(newPoints.toLocaleString())
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