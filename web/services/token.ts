"use server"
import { Connection, PublicKey } from "@solana/web3.js"
import { Metaplex } from "@metaplex-foundation/js"
import { getTokenMetadata } from "@solana/spl-token"
import { Token, TokenType } from "@/types/token"
import { unstable_cache } from 'next/cache'
import { getCachedPrices, updateCachedPrice, getExpiredTokenIds, getAllCachedPrices } from './cache'
import { Decimal } from 'decimal.js'
import { TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID, WSOL_MINT } from '@/config'
import { RPC_ENDPOINT } from '@/config/server'
import { sleep } from "@/utils/sleep"
import { TokenStandard } from '@metaplex-foundation/mpl-token-metadata'

const CHUNK_SIZE = 5;

interface TokenMetadata {
  image?: string
}

export async function getTokenImageUri(tokenId: string, uri?: string): Promise<string | undefined> {
  if (!uri) return undefined

  return unstable_cache(
    async () => {
      try {
        const response = await fetch(uri)
        if (!response.ok) {
          console.error(`Failed to fetch metadata from ${uri}: ${response.statusText}`)
          return undefined
        }
        const metadata: TokenMetadata = await response.json()
        return metadata.image
      } catch (error) {
        console.error(`Error fetching token ${tokenId} metadata: ${error}`)
        return undefined
      }
    },
    [`token-image-uri-${tokenId}`], // 토큰 ID별로 캐시 키 생성
    {
      revalidate: false,
      tags: ['token-image-uri']
    }
  )()
}

export async function getSftTokens(ownerAddress: string) {
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

    const chunks = []
    for (let i = 0; i < mintAddresses.length; i += CHUNK_SIZE) {
      chunks.push(mintAddresses.slice(i, i + CHUNK_SIZE))
    }

    const metadataList = []
    for (const chunk of chunks) {
      await sleep(50)  // 각 청크 처리 전 딜레이
      const chunkMetadata = await metaplex.nfts().findAllByMintList({ mints: chunk })
      metadataList.push(...chunkMetadata)
    }

    const processedTokens = await Promise.all(
      metadataList
        .filter((item): item is any => {
          if (!item) return false
        
          const nonFungibleTypes = [
            TokenStandard.NonFungible,
            TokenStandard.NonFungibleEdition,
            TokenStandard.ProgrammableNonFungible,
            TokenStandard.ProgrammableNonFungibleEdition
          ]
          
          const tokenStandard = item.tokenStandard
          return !tokenStandard || !nonFungibleTypes.includes(tokenStandard)
        })
        .map(async item => {
          const tokenAccount = tokenAccounts.value.find(
            ta => ta.account.data.parsed.info.mint === item.mintAddress.toString()
          )

          const token: Token = {
            id: item.mintAddress.toString(),
            mint: item.address.toString(),
            name: item.name,
            symbol: item.symbol,
            uri: item.uri,
            description: "",
            multiplier: "1000",
            imageUri: undefined,
            amount: tokenAccount?.account.data.parsed.info.tokenAmount.uiAmount || 0,
            decimals: tokenAccount?.account.data.parsed.info.tokenAmount.decimals || 0,
            type: TokenType.UNKNOWN
          }

          token.imageUri = await getTokenImageUri(token.id, token.uri)
          return token
        })
    )

    return processedTokens
  } catch (error) {
    console.error('Error in getSftTokens:', error)
    throw error
  }
}

export async function getToken2022s(ownerAddress: string) {
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
        
        // decimals가 0이면 NFT로 간주하고 필터링
        if (account.account.data.parsed.info.tokenAmount.decimals === 0) {
          return null
        }

        const token: Token = {
          id: new PublicKey(mintAddress).toString(),
          mint: mintAddress,
          name: metadata?.name || 'Unknown',
          symbol: metadata?.symbol || 'UNKNOWN',
          uri: metadata?.uri || '',
          description: "",
          multiplier: "1000",
          imageUri: undefined,
          amount: account.account.data.parsed.info.tokenAmount.uiAmount,
          decimals: account.account.data.parsed.info.tokenAmount.decimals || 0,
          type: TokenType.UNKNOWN
        }

        token.imageUri = await getTokenImageUri(token.id, token.uri)
        await sleep(50)
        return token
      })
    )

    return processedTokens.filter((token): token is Token => token !== null)
  } catch (error) {
    console.error('Error in getToken2022s:', error)
    throw error
  }
}

export async function getTokenPrices(tokenIds: string[]): Promise<Record<string, string>> {
  try {
    const cachedPrices = await getCachedPrices(tokenIds)
    
    const uncachedTokenIds = tokenIds.filter(id => !cachedPrices[id])
    const expiredTokenIds = getExpiredTokenIds(cachedPrices)
    const tokensToFetch = [...new Set([...uncachedTokenIds, ...expiredTokenIds])]

    if (tokensToFetch.length === 0) {
      return Object.fromEntries(
        Object.entries(cachedPrices).map(([id, data]) => [id, data.price.toString()])
      )
    }

    // First, get WSOL price in USD
    const wsolResponse = await fetch(
      `https://lite-api.jup.ag/price/v3?ids=${WSOL_MINT}`
    )
    
    if (!wsolResponse.ok) {
      throw new Error(`Failed to fetch WSOL price: ${wsolResponse.statusText}`)
    }
    
    const wsolData = await wsolResponse.json()
    const wsolUsdPrice = wsolData[WSOL_MINT]?.usdPrice
    
    if (!wsolUsdPrice) {
      throw new Error('Failed to get WSOL USD price')
    }

    const chunks = []
    // v3 API supports up to 50 tokens per request
    for (let i = 0; i < tokensToFetch.length; i += 50) {
      chunks.push(tokensToFetch.slice(i, i + 50))
    }

    const newPrices: Record<string, string> = {}
    
    for (const chunk of chunks) {
      const ids = chunk.join(',')
      const response = await fetch(
        `https://lite-api.jup.ag/price/v3?ids=${ids}`
      )
      
      if (!response.ok) {
        throw new Error(`Failed to fetch prices: ${response.statusText}`)
      }

      const data = await response.json()
      
      // v3 API returns token prices in USD
      for (const [tokenId, priceInfo] of Object.entries(data || {})) {
        if (priceInfo && typeof priceInfo === 'object' && 'usdPrice' in priceInfo) {
          // Convert USD price to WSOL price for backward compatibility
          const usdPrice = (priceInfo as any).usdPrice
          const wsolPrice = usdPrice / wsolUsdPrice
          newPrices[tokenId] = String(wsolPrice)
        } else {
          newPrices[tokenId] = '0'
        }
      }
    }

    await Promise.all(
      Object.entries(newPrices).map(([tokenId, price]) => 
        updateCachedPrice(tokenId, new Decimal(price))
      )
    )

    return {
      ...Object.fromEntries(
        Object.entries(cachedPrices)
          .filter(([id]) => !expiredTokenIds.includes(id))
          .map(([id, data]) => [id, data.price.toString()])
      ),
      ...newPrices
    }
  } catch (error) {
    console.error('Error fetching token prices:', error)
    return {}
  }
}

export async function fetchToken(mintAddress: string): Promise<Token | undefined> {
  try {
    const connection = new Connection(RPC_ENDPOINT)
    const metaplex = new Metaplex(connection)
    const mintPubkey = new PublicKey(mintAddress)

    let metadata: any = undefined
    try {
      metadata = await metaplex.nfts().findByMint({ mintAddress: mintPubkey })
    } catch (error) {
      return undefined
    } 
    
    if (!metadata) return undefined

    const token: Token = {
      id: mintAddress,
      mint: metadata.address.toString(),
      name: metadata.name,
      symbol: metadata.symbol,
      uri: metadata.uri,
      description: "",
      multiplier: "1000",
      imageUri: undefined,
      amount: "0", // amount는 여기서는 필요 없음
      decimals: metadata.mint.decimals || 0,
      type: TokenType.UNKNOWN
    }

    token.imageUri = await getTokenImageUri(token.id, token.uri)
    return token
  } catch (error) {
    console.error('Error fetching token:', error)
    return undefined
  }
}
