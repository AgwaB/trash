"use server"
import { Connection, PublicKey } from "@solana/web3.js"
import { Metaplex, Nft, Sft } from "@metaplex-foundation/js"
import { getTokenMetadata } from "@solana/spl-token"
import { Token, TokenType } from "@/types/token"
import { unstable_cache } from 'next/cache'
import { getCachedPrices, updateCachedPrice, getExpiredTokenIds, getAllCachedPrices } from './cache'
import { Decimal } from 'decimal.js'

const TOKEN_PROGRAM_ID = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA")
const TOKEN_2022_PROGRAM_ID = new PublicKey("TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb")
const RPC_ENDPOINT = "https://wispy-cold-gadget.solana-mainnet.quiknode.pro/81a007c42698b140c9c618ca05162bcf56f34e8d"
const WSOL_MINT = "So11111111111111111111111111111111111111112"

// Token Whitelist Interface
interface WhitelistedToken {
  mint: string
  type: TokenType
  points: number
}

// Recent Recycled Interface
interface RecentRecycled {
  amount: number
  symbol: string
}

// Total Recycled Interface
interface TotalRecycled {
  amount: number
  symbol: string
}

const CHUNK_SIZE = 5; // 한 번에 처리할 mint 주��� 수

interface TokenMetadata {
  image?: string
}

interface TokenPrice {
  id: string
  type: string
  price: string
}

interface JupiterPriceResponse {
  data: Record<string, TokenPrice | null>
  timeTaken: number
}

// 이미지 URI를 가져오는 기본 함수
async function getTokenImageUri(token: Token): Promise<string | undefined> {
  if (!token.uri) return undefined

  return unstable_cache(
    async () => {
      try {
        const response = await fetch(token.uri)
        if (!response.ok) {
          console.error(`Failed to fetch metadata from ${token.uri}: ${response.statusText}`)
          return undefined
        }
        const metadata: TokenMetadata = await response.json()
        return metadata.image
      } catch (error) {
        console.error(`Error fetching token ${token.id} metadata: ${error}`)
        return undefined
      }
    },
    [`token-image-uri-${token.id}`], // 토큰 ID별로 캐시 키 생성
    {
      revalidate: false,
      tags: ['token-image-uri']
    }
  )()
}

async function getSftTokens(ownerAddress: string) {
  try {
    const connection = new Connection(RPC_ENDPOINT)
    const metaplex = new Metaplex(connection)
    
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
      new PublicKey(ownerAddress),
      { programId: TOKEN_PROGRAM_ID }
    )

    const mintAddresses = tokenAccounts.value.map(
      ta => new PublicKey(ta.account.data.parsed.info.mint)
    )

    // Chunk the mint addresses
    const chunks = []
    for (let i = 0; i < mintAddresses.length; i += CHUNK_SIZE) {
      chunks.push(mintAddresses.slice(i, i + CHUNK_SIZE))
    }

    // Process each chunk and combine results
    const metadataList = []
    for (const chunk of chunks) {
      const chunkMetadata = await metaplex.nfts().findAllByMintList({ mints: chunk })
      metadataList.push(...chunkMetadata)
    }
    
    const processedTokens = await Promise.all(
      metadataList
        .filter((item): item is any => item !== null)
        .map(async item => {
          const token: Token = {
            id: item.mintAddress.toString(),
            mint: item.address.toString(),
            name: item.name,
            symbol: item.symbol,
            uri: item.uri,
            description: item.json?.description || "",
            imageUri: undefined,
            amount: tokenAccounts.value.find(
              ta => ta.account.data.parsed.info.mint === item.mintAddress.toString()
            )?.account.data.parsed.info.tokenAmount.uiAmount || 0,
            type: TokenType.UNKNOWN
          }

          token.imageUri = await getTokenImageUri(token)
          return token
        })
    )

    return processedTokens
  } catch (error) {
    console.error('Error in getSftTokens:', error)
    throw error
  }
}

async function getToken2022s(ownerAddress: string) {
  try {
    const connection = new Connection(RPC_ENDPOINT)
    const owner = new PublicKey(ownerAddress)

    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
      owner, 
      { programId: TOKEN_2022_PROGRAM_ID }
    )

    const processedTokens = await Promise.all(
      tokenAccounts.value.map(async (account) => {
        const mintAddress = account.account.data.parsed.info.mint
        const metadata = await getTokenMetadata(connection, new PublicKey(mintAddress))
        
        const token: Token = {
          id: new PublicKey(mintAddress).toString(),
          mint: mintAddress,
          name: metadata?.name || 'Unknown',
          symbol: metadata?.symbol || 'UNKNOWN',
          uri: metadata?.uri || '',
          description: "",
          imageUri: undefined,
          amount: account.account.data.parsed.info.tokenAmount.uiAmount,
          type: TokenType.UNKNOWN
        }

        token.imageUri = await getTokenImageUri(token)
        return token
      })
    )

    return processedTokens
  } catch (error) {
    console.error('Error in getToken2022s:', error)
    throw error
  }
}

// 토큰 가격 정보를 져오는 함수
async function fetchTokenPrices(tokenIds: string[]): Promise<Record<string, Decimal>> {
  try {
    // 최시된 가격 정보 확인
    const cachedPrices = await getCachedPrices(tokenIds)
    
    // 캐시되지 않은 토큰 ID들 필터링
    const uncachedTokenIds = tokenIds.filter(id => !cachedPrices[id])
    
    // 만료된 캐시 항목 확인
    const expiredTokenIds = getExpiredTokenIds(cachedPrices)
    
    // 조회가 필요한 토큰 ID들
    const tokensToFetch = [...new Set([...uncachedTokenIds, ...expiredTokenIds])]
    console.log(`tokensToFetch: ${tokensToFetch.length}`)
    if (tokensToFetch.length === 0) {
      // 모든 토큰이 유효한 캐시를 가지고 있는 경우
      return Object.fromEntries(
        Object.entries(cachedPrices).map(([id, data]) => [id, data.price])
      )
    }

    // 최대 100개씩 나누어 요청
    const chunks = []
    for (let i = 0; i < tokensToFetch.length; i += 100) {
      chunks.push(tokensToFetch.slice(i, i + 100))
    }

    const newPrices: Record<string, Decimal> = {}
    
    for (const chunk of chunks) {
      const ids = chunk.join(',')
      const response = await fetch(
        `https://api.jup.ag/price/v2?ids=${ids}&vsToken=${WSOL_MINT}`
      )
      
      if (!response.ok) {
        throw new Error(`Failed to fetch prices: ${response.statusText}`)
      }

      const data: JupiterPriceResponse = await response.json()
      
      // 각 토큰의 가격 정보를 저장
      for (const [tokenId, priceInfo] of Object.entries(data.data)) {
        if (priceInfo && priceInfo.price) {
          // 문자열을 Decimal로 직접 변환
          newPrices[tokenId] = new Decimal(priceInfo.price)
        } else {
          newPrices[tokenId] = new Decimal(0)
        }
      }
    }

    // 새로운 가격 정보 개별 캐시 업데이트
    await Promise.all(
      Object.entries(newPrices).map(([tokenId, price]) => 
        updateCachedPrice(tokenId, price)
      )
    )

    // 캐시된 가격과 새로운 가격 정보 병합
    return {
      ...Object.fromEntries(
        Object.entries(cachedPrices)
          .filter(([id]) => !expiredTokenIds.includes(id))
          .map(([id, data]) => [id, data.price])
      ),
      ...newPrices
    }
  } catch (error) {
    console.error('Error fetching token prices:', error)
    return {}
  }
}

// 서버 사이드 폴링을 위한 함수
export async function updateExpiredPrices(): Promise<void> {
  try {
    const cachedPrices = await getAllCachedPrices()
    const expiredTokenIds = getExpiredTokenIds(cachedPrices)

    if (expiredTokenIds.length > 0) {
      await fetchTokenPrices(expiredTokenIds)
    }
  } catch (error) {
    console.error('Error updating expired prices:', error)
  }
}

// 캐시된 가격 정보를 가져오는 함수
export async function getTokenPrices(tokenIds: string[]): Promise<Record<string, Decimal>> {
  return unstable_cache(
    async () => {
      return fetchTokenPrices(tokenIds)
    },
    ['token-prices'],
    {
      revalidate: 60, // 1분마다 갱신
      tags: ['token-prices']
    }
  )()
}

// fetchTokens 함수 수정
export async function fetchTokens(ownerAddress: string): Promise<Token[]> {
  return unstable_cache(
    async () => {
      try {
        const [sftTokens, token2022s] = await Promise.all([
          getSftTokens(ownerAddress),
          getToken2022s(ownerAddress)
        ])
        
        const tokens = [...sftTokens, ...token2022s]
        
        // 토큰 가격 정보 가져오기
        const tokenIds = tokens.map(token => token.id)
        const prices = await getTokenPrices(tokenIds)
        
        // 토큰에 SOL 가치 추가
        return tokens.map(token => ({
          ...token,
          amount: token.amount.toString(),
          solValue: prices[token.id]?.toString() || '0'
        }));
      } catch (error) {
        console.error('Error in fetchTokens:', error)
        throw error
      }
    },
    [`tokens-${ownerAddress}`],
    {
      revalidate: 120,
      tags: ['tokens']
    }
  )()
}

export async function fetchPoints(address: string): Promise<number> {
  // TODO: Implement points fetching logic
  return Math.floor(Math.random() * 1000000)
}

export async function fetchTotalRecycled(): Promise<TotalRecycled> {
  // TODO: Implement total recycled fetching logic
  return {
    amount: Math.floor(Math.random() * 10000000),
    symbol: "$PEPE"
  }
}

export async function fetchRecentRecycled(): Promise<RecentRecycled> {
  // TODO: Implement recent recycled fetching logic
  return {
    amount: Math.floor(Math.random() * 1000000),
    symbol: "$WIF"
  }
}