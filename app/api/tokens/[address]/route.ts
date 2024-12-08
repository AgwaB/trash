import { NextResponse } from 'next/server'
import { unstable_cache } from 'next/cache'
import { fetchTokens as fetchTokensService } from '@/services/token'

export async function GET(
  request: Request,
  { params }: { params: { address: string } }
) {
  const address = params.address

  const tokens = await unstable_cache(
    async () => {
      return fetchTokensService(address)
    },
    [`tokens-${address}`],
    {
      revalidate: 120,
      tags: ['tokens']
    }
  )()

  return NextResponse.json(tokens)
} 