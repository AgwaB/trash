import useSWR from 'swr'
import { fetchTokens } from '@/services/token'

export function useTokens(address: string | undefined) {
  const { data, error, isLoading, mutate } = useSWR(
    address ? `tokens/${address}` : null,
    () => address ? fetchTokens(address) : null,
    {
      revalidateOnFocus: false,  // 포커스시 재검증 비활성화
      dedupingInterval: 60000,   // 1분간 캐시 유지
    }
  )

  return {
    tokens: data,
    isLoading,
    isError: error,
    mutate, // 수동으로 데이터를 갱신할 때 사용
  }
} 