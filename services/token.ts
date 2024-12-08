import { Connection, PublicKey } from "@solana/web3.js"
import { Metaplex, Nft, Sft } from "@metaplex-foundation/js"
import { getAccount, getTokenMetadata } from "@solana/spl-token"
import { Token, TokenType } from "@/types/token"

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

async function fetchTokenMetadata(uri: string): Promise<string | undefined> {
  try {
    const response = await fetch(uri)
    const metadata: TokenMetadata = await response.json()
    return metadata.image
  } catch (error) {
    console.error('Error fetching token metadata:', error)
    return undefined
  }
}

async function getSftTokens(ownerAddress: string) {
  const connection = new Connection(RPC_ENDPOINT)
  const metaplex = new Metaplex(connection)
  
  console.log(1);
  const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
    new PublicKey(ownerAddress),
    { programId: TOKEN_PROGRAM_ID }
  )
  console.log(2);
  const mintAddresses = tokenAccounts.value.map(
    ta => new PublicKey(ta.account.data.parsed.info.mint)
  )
  console.log(3);
  
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
  
  console.log(4);
  const processedTokens = await Promise.all(
    metadataList
      .filter((item): item is Nft | Sft => item !== null)
      .map(async item => {
        let imageUrl: string | undefined
        if (item.uri) {
          imageUrl = await fetchTokenMetadata(item.uri)
        }

        return {
          id: item.address.toString(),
          mint: item.address.toString(),
          name: item.name,
          symbol: item.symbol,
          uri: item.uri,
          description: item.json?.description || "",
          image: imageUrl,  // undefined if fetch fails
          amount: tokenAccounts.value.find(
            ta => ta.account.data.parsed.info.mint === item.address.toString()
          )?.account.data.parsed.info.tokenAmount.uiAmount || 0,
          type: TokenType.UNKNOWN
        }
      })
  )

  return processedTokens
}

async function getToken2022s(ownerAddress: string) {
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
      
      let imageUrl: string | undefined
      if (metadata?.uri) {
        imageUrl = await fetchTokenMetadata(metadata.uri)
      }

      return {
        id: account.pubkey.toString(),
        mint: mintAddress,
        name: metadata?.name || 'Unknown',
        symbol: metadata?.symbol || 'UNKNOWN',
        uri: metadata?.uri || '',
        description: "",
        image: imageUrl,  // undefined if fetch fails
        amount: account.account.data.parsed.info.tokenAmount.uiAmount,
        type: TokenType.UNKNOWN
      }
    })
  )

  return processedTokens
}

export async function fetchTokens(ownerAddress: string): Promise<Token[]> {
  try {
    const [sftTokens, token2022s] = await Promise.all([
      getSftTokens(ownerAddress),
      getToken2022s(ownerAddress)
    ])

    console.log(`ownerAddress: ${ownerAddress}`)

    const tokens =  [...sftTokens, ...token2022s];
    console.log(`tokens: ${JSON.stringify(tokens)}`)
    return tokens
  } catch (error) {
    console.error('Error fetching tokens:', error)
    throw error
  }
}

export async function recycleTokens(tokenIds: string[]): Promise<void> {
  // TODO: Implement token recycling logic
  console.log('Recycling tokens:', tokenIds)
}

export async function fetchRecentRecycled(): Promise<RecentRecycled> {
  // TODO: Implement recent recycled fetching logic
  return {
    amount: Math.floor(Math.random() * 1000000),
    symbol: "$WIF"
  }
}

export async function fetchTotalRecycled(): Promise<TotalRecycled> {
  // TODO: Implement total recycled fetching logic
  return {
    amount: Math.floor(Math.random() * 10000000),
    symbol: "$PEPE"
  }
}

export async function fetchPoints(address: string): Promise<number> {
  // TODO: Implement points fetching logic
  return Math.floor(Math.random() * 1000000)
}