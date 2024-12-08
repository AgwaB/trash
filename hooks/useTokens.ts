"use client"
import useSWR from 'swr'
import { fetchTokens } from '@/services/token'

export function useTokens(address: string | undefined) {
  const { data, error, isLoading, mutate } = useSWR(
    address ? `tokens/${address}` : null,
    async () => {
      if (!address) return null
      const result = await fetchTokens(address)
      return result
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 120000,
    }
  )

  return {
    tokens: data,
    isLoading,
    isError: error,
    mutate,
  }
} 