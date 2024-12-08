"use server"
import { Connection, PublicKey } from "@solana/web3.js"
import { Metaplex, Nft, Sft } from "@metaplex-foundation/js"
import { getTokenMetadata } from "@solana/spl-token"
import { Token, TokenType } from "@/types/token"
import { unstable_cache } from 'next/cache'

const TOKEN_PROGRAM_ID = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA")
const TOKEN_2022_PROGRAM_ID = new PublicKey("TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb")
const RPC_ENDPOINT = "https://wispy-cold-gadget.solana-mainnet.quiknode.pro/81a007c42698b140c9c618ca05162bcf56f34e8d"

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

const CHUNK_SIZE = 5; // 한 번에 처리할 mint 주소 수

interface TokenMetadata {
  image?: string
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
        console.error('Error fetching token metadata:', error)
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
        .filter((item): item is Nft | Sft => item !== null)
        .map(async item => {
          const token: Token = {
            id: item.address.toString(),
            mint: item.address.toString(),
            name: item.name,
            symbol: item.symbol,
            uri: item.uri,
            description: item.json?.description || "",
            imageUri: undefined,
            amount: tokenAccounts.value.find(
              ta => ta.account.data.parsed.info.mint === item.address.toString()
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
          id: account.pubkey.toString(),
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

// 캐시된 버전의 함수 생성
export async function fetchTokens(ownerAddress: string): Promise<Token[]> {
  return unstable_cache(
    async () => {
      try {
        const [sftTokens, token2022s] = await Promise.all([
          getSftTokens(ownerAddress),
          getToken2022s(ownerAddress)
        ])
        
        const tokens = [...sftTokens, ...token2022s]
        return tokens
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