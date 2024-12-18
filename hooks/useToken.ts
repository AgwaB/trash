import useSWR from 'swr'
import { Connection, PublicKey } from "@solana/web3.js"
import { Metaplex } from "@metaplex-foundation/js"
import { Token, TokenType } from "@/types/token"
import { RPC_ENDPOINT } from '@/config'
import { getTokenImageUri } from '@/services/token'

export function useToken(mintAddress: string | undefined) {
  const { data: token, isLoading } = useSWR(
    mintAddress ? `token/${mintAddress}` : null,
    async () => {
      if (!mintAddress) return null
      
      const connection = new Connection(RPC_ENDPOINT)
      const metaplex = new Metaplex(connection)
      const mintPubkey = new PublicKey(mintAddress)

      try {
        const metadata = await metaplex.nfts().findByMint({ mintAddress: mintPubkey })
        if (!metadata) return null

        const token: Token = {
          id: mintAddress,
          mint: metadata.address.toString(),
          name: metadata.name,
          symbol: metadata.symbol,
          uri: metadata.uri,
          description: "",
          multiplier: "1",
          imageUri: undefined,
          amount: "0",
          decimals: metadata.mint.decimals || 0,
          type: TokenType.UNKNOWN
        }

        token.imageUri = await getTokenImageUri(token)
        return token
      } catch (error) {
        console.error('Error fetching token:', error)
        return null
      }
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 120000,
    }
  )

  return { token, isLoading }
} 