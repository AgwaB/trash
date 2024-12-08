import useSWR from 'swr'

interface TokenMetadata {
  image?: string
}

async function fetchMetadata(uri: string): Promise<TokenMetadata | undefined> {
  try {
    const response = await fetch(uri)
    if (!response.ok) {
      console.error(`Failed to fetch metadata from ${uri}: ${response.statusText}`)
      return undefined
    }
    const data = await response.json()
    return data
  } catch (error) {
    console.error(`Error fetching metadata from ${uri}:`, error)
    return undefined
  }
}

export function useTokenMetadata(uri: string | undefined) {
  const { data } = useSWR<TokenMetadata | undefined>(
    uri ? `metadata/${uri}` : null,
    () => uri ? fetchMetadata(uri) : undefined,
    {
      revalidateOnFocus: false,
      dedupingInterval: Infinity,  // 이미지 URL은 영구적으로 캐시
      shouldRetryOnError: false,   // 에러 시 재시도 하지 않음
    }
  )

  return {
    imageUrl: data?.image
  }
} 