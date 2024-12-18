"use client"
import useSWR from 'swr'
import { getSftTokens, getToken2022s, getTokenPrices } from '@/services/token'
import { Token, TokenType, TokenDescription } from '@/types/token'
import { useMemo } from 'react'
import { getAllLabels } from '@/services/contract'

// 주소 기반으로 토큰 타입 결정
function getAddressType(address: string, numTypes: number = 4): number {
  let sum = 0;
  for (const char of address) {
    sum += char.charCodeAt(0);
  }
  return (sum % numTypes) + 1;
}

// 토큰 타입에 따른 설명 반환
function getTokenDescription(typeIndex: number): TokenDescription {
  switch (typeIndex) {
    case 1: return TokenDescription.RUG
    case 2: return TokenDescription.TRASH
    case 3: return TokenDescription.POOP
    case 4: return TokenDescription.GARBAGE
    default: return TokenDescription.TRASH
  }
}

export function useTokens(address: string | undefined) {
  // 1. 기본 토큰 데이터 가져오기
  const { data: basicTokens, isLoading: isLoadingTokens, mutate: mutateBasicTokens } = useSWR(
    address ? `basic-tokens/${address}` : null,
    async () => {
      if (!address) return null
      const [sftTokens, token2022s] = await Promise.all([
        getSftTokens(address),
        getToken2022s(address)
      ])
      return [...sftTokens, ...token2022s]
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 120000,
    }
  )

  // 2. 가격 정보 가져오기
  const { data: prices, isLoading: isLoadingPrices } = useSWR(
    basicTokens ? `token-prices/${basicTokens.map(t => t.id).join(',')}` : null,
    async () => {
      if (!basicTokens) return null
      const tokenIds = basicTokens.map(token => token.id)
      return getTokenPrices(tokenIds)
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 120000,
    }
  )

  // 3. 라벨 정보 가져오기
  const { data: labels, isLoading: isLoadingLabels } = useSWR(
    'token-labels',
    getAllLabels,
    {
      revalidateOnFocus: false,
      dedupingInterval: 120000,
    }
  )

  // 4. 모든 데이터를 조합하여 최종 토큰 목록 생성
  const tokens = useMemo(() => {
    if (!basicTokens || !prices || !labels) return null

    return basicTokens.map(token => {
      // 라벨이 있는 경우 해당 라벨 사용, 없는 경우 주소 기반으로 생성
      const label = labels[token.id] || {
        description: getTokenDescription(getAddressType(token.id)),
        multiplier: 1
      }

      return {
        ...token,
        solValue: prices[token.id] || '0',
        description: label.description.replace(/\*/g, ''),
        multiplier: typeof label.multiplier === 'object' 
          ? label.multiplier.toString() // BN 객체인 경우
          : label.multiplier.toString() // 숫자인 경우
      }
    })
  }, [basicTokens, prices, labels])

  const isLoading = isLoadingTokens || isLoadingPrices || isLoadingLabels

  return {
    tokens,
    isLoading,
    isError: !tokens && !isLoading,
    mutate: async () => {
      await mutateBasicTokens(undefined, {
        revalidate: true
      })
    }
  }
} 