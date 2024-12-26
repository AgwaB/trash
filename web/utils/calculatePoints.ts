import { Token } from '@/types/token'
import { Decimal } from 'decimal.js'

// 단일 토큰의 포인트 계산
export function calculateTokenPoints(token: Token): string {
  if (!token.solValue) return '0'
  return new Decimal(token.solValue)
    .mul(token.amount)
    .mul(token.multiplier)
    .toFixed(4)
}

// 선택된 토큰들의 총 포인트 계산
export function calculateTotalPoints(tokens: Token[], selectedTokens: string[]): string {
  return tokens
    .filter(token => selectedTokens.includes(token.id))
    .reduce((total, token) => {
      if (token.solValue) {
        const value = new Decimal(token.solValue)
        const amount = new Decimal(token.amount)
        const multiplier = new Decimal(token.multiplier)
        return total.plus(value.mul(amount).mul(multiplier))
      }
      return total
    }, new Decimal(0))
    .toFixed(5)
} 