"use client"
import useSWR from 'swr'
import { fetchVaultInfo } from '@/services/contract'

interface VaultInfo {
  totalSolDeposited: string;
  totalSolWithdrawn: string;
}

export function useVaultInfo() {
  const { data, error, mutate } = useSWR(
    'vaultInfo',
    fetchVaultInfo,
    {
      refreshInterval: 0,
      revalidateOnFocus: false
    }
  )

  return {
    vaultInfo: data || { totalSolDeposited: '0', totalSolWithdrawn: '0' },
    isLoading: !error && !data,
    isError: error,
    mutateVaultInfo: mutate
  }
} 