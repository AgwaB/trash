"use client"
import { useState, useEffect } from 'react'
import { fetchVaultInfo } from '@/services/contract'

interface VaultInfo {
  totalSolDeposited: string;
  totalSolWithdrawn: string;
}

export function useVaultInfo() {
  const [vaultInfo, setVaultInfo] = useState<VaultInfo>({
    totalSolDeposited: '0',
    totalSolWithdrawn: '0'
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const getVaultInfo = async () => {
      try {
        const info = await fetchVaultInfo()
        if (info) {
          setVaultInfo(info)
        }
      } catch (error) {
        console.error('Error fetching vault info:', error)
      } finally {
        setIsLoading(false)
      }
    }

    getVaultInfo()
    const interval = setInterval(getVaultInfo, 10000)

    return () => clearInterval(interval)
  }, [])

  return { vaultInfo, isLoading }
} 