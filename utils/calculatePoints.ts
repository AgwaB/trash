import { Decimal } from 'decimal.js'
import { Token } from '@/types/token'

export function calculateTokenPoints(token: Token): Decimal {
  const amount = new Decimal(token.amount || '0')
  const solValue = new Decimal(token.solValue || '0')
  const multiplier = new Decimal(token.multiplier || '1')
  
  // 토큰의 총 SOL 가치 계산
  const totalSolValue = solValue.mul(amount)
  
  // SOL 가치를 포인트로 변환 (1 SOL = 100 points)
  return totalSolValue.mul(100).mul(multiplier)
}

export function calculateTotalPoints(tokens: Token[], selectedTokenIds: string[]): number {
  return selectedTokenIds.reduce((acc, tokenId) => {
    const token = tokens.find(t => t.id === tokenId)
    if (!token) return acc

    const points = calculateTokenPoints(token)
    return acc.plus(points)
  }, new Decimal(0)).toNumber()
} 