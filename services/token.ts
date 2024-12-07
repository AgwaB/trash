"use server"
import { Token, TokenDescription } from '@/types/token'

// ID가 없는 토큰 데이터 타입
interface TokenData {
  name: string
  description: TokenDescription
  image: string
}

const mockTokenData: TokenData[] = [
  {
    name: '$JTO (312.201)',
    description: TokenDescription.UTILITY_TRASH,
    image: '/images/token1.png'
  },
  {
    name: '$BONK (1,234,567)',
    description: TokenDescription.TRASH,
    image: '/images/token2.png'
  },
  {
    name: '$SAMO (98,765)',
    description: TokenDescription.SHINY_TRASH,
    image: '/images/token3.png'
  },
  {
    name: '$COPE (45,678)',
    description: TokenDescription.POOP,
    image: '/images/token4.png'
  },
  {
    name: '$DUST (789,012)',
    description: TokenDescription.GARBAGE,
    image: '/images/token5.png'
  }
]

export async function fetchTokens(walletAddress: string): Promise<Token[]> {
  // TODO: 실제 API 호출로 대체
  return new Promise((resolve) => {
    setTimeout(() => {
      // 각 토큰에 고유 ID 부여
      const tokensWithIds = mockTokenData.map((token, index) => ({
        ...token,
        id: `token-${index + 1}`
      }))
      resolve(tokensWithIds)
    }, 1500)
  })
}

export async function recycleTokens(tokenIds: string[]): Promise<number> {
  // TODO: 실제 리사이클 API 호출로 대체
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(123456789) // mock points
    }, 1000)
  })
}

export async function fetchPoints(walletAddress: string): Promise<number> {
  // TODO: 실제 API 호출로 대체
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(123456789)
    }, 500)
  })
}

export async function fetchRecentRecycled(): Promise<{
  amount: number
  symbol: string
}> {
  // 100,000에서 999,999 사이의 랜덤한 숫자 생성
  const randomAmount = Math.floor(Math.random() * 900000) + 100000
  
  // 랜덤 토큰 심볼 목록
  const symbols = [
    "$WIF",
    "$BONK",
    "$SAMO",
    "$DUST",
    "$COPE",
    "$JTO",
    "$MEME",
    "$PEPE"
  ]
  
  // 랜덤하게 심볼 선택
  const randomSymbol = symbols[Math.floor(Math.random() * symbols.length)]

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        amount: randomAmount,
        symbol: randomSymbol
      })
    }, 500)
  })
} 