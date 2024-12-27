import { unstable_cache } from 'next/cache'
import { Decimal } from 'decimal.js'

interface CachedPrice {
  price: Decimal
  timestamp: number
}

const CACHE_DURATION = 60 // 1분
const CACHED_TOKEN_IDS_KEY = 'cached-token-ids'

export async function getCachedPrice(tokenId: string): Promise<CachedPrice | null> {
  return unstable_cache(
    async () => {
      // unstable_cache가 캐시된 값이 있으면 그 값을 반환하고,
      // 없으면 이 함수의 반환값을 캐시
      return null
    },
    [`token-price-${tokenId}`],
    {
      tags: ['price-cache'],
      revalidate: CACHE_DURATION
    }
  )()
}

export async function getCachedPrices(tokenIds: string[]): Promise<Record<string, CachedPrice>> {
  const prices: Record<string, CachedPrice> = {}
  
  await Promise.all(
    tokenIds.map(async (tokenId) => {
      const cached = await getCachedPrice(tokenId)
      if (cached) {
        prices[tokenId] = cached
      }
    })
  )
  
  return prices
}

export async function getAllCachedTokenIds(): Promise<string[]> {
  return unstable_cache(
    async () => {
      return [] as string[]
    },
    [CACHED_TOKEN_IDS_KEY],
    {
      tags: ['price-cache'],
      revalidate: CACHE_DURATION
    }
  )()
}

async function updateCachedTokenIds(tokenId: string): Promise<void> {
  const tokenIds = await getAllCachedTokenIds()
  if (!tokenIds.includes(tokenId)) {
    await unstable_cache(
      async () => [...tokenIds, tokenId],
      [CACHED_TOKEN_IDS_KEY],
      {
        tags: ['price-cache'],
        revalidate: CACHE_DURATION
      }
    )()
  }
}

export async function updateCachedPrice(tokenId: string, price: Decimal): Promise<void> {
  const now = Date.now()
  
  await unstable_cache(
    async () => ({
      price,
      timestamp: now
    }),
    [`token-price-${tokenId}`],
    {
      tags: ['price-cache'],
      revalidate: CACHE_DURATION
    }
  )()
}

export async function getAllCachedPrices(): Promise<Record<string, CachedPrice>> {
  const tokenIds = await getAllCachedTokenIds()
  return getCachedPrices(tokenIds)
}

export function getExpiredTokenIds(cache: Record<string, CachedPrice>): string[] {
  const now = Date.now()
  return Object.entries(cache)
    .filter(([, data]) => now - data.timestamp > CACHE_DURATION)
    .map(([tokenId]) => tokenId)
} 