import React, { useEffect } from 'react'
import { Token } from '@/types/token'
import TokenItem from './TokenItem'
import TableHeader from './TableHeader'
import { Decimal } from 'decimal.js'

interface TokenListProps {
  tokens: Token[]
  selectedTokens: string[]
  onSelectToken: (tokenId: string) => void
  onPointsChange: (points: string) => void
  isMobile?: boolean
}

const calculatePoints = (tokens: Token[], selectedTokens: string[]) => {
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
    .toFixed(20)
}

export default function TokenList({ 
  tokens, 
  selectedTokens, 
  onSelectToken, 
  onPointsChange,
  isMobile = false 
}: TokenListProps) {
  const sortedTokens = [...tokens]
  // Filter out tokens with zero amount and then sort
    .filter(token => new Decimal(token.amount || '0').gt(0))
    .sort((a, b) => {
      const aAmount = new Decimal(a.amount || '0')
      const bAmount = new Decimal(b.amount || '0')
      const aSolValue = new Decimal(a.solValue || '0')
      const bSolValue = new Decimal(b.solValue || '0')
      
      const aTotalValue = aSolValue.mul(aAmount)
      const bTotalValue = bSolValue.mul(bAmount)
      
      return bTotalValue.minus(aTotalValue).toNumber()
    })

  useEffect(() => {
    const points = calculatePoints(tokens, selectedTokens)
    console.log(`calculatePoints: ${points}`)
    onPointsChange(points)
  }, [selectedTokens, tokens, onPointsChange])

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-shrink-0">
        <TableHeader isMobile={isMobile} />
      </div>
      <div className="flex-1 overflow-y-auto min-h-0 scrollbar-win98">
        {sortedTokens.map((token, index) => (
          <TokenItem
            key={token.id}
            token={token}
            index={index}
            onSelect={onSelectToken}
            isSelected={selectedTokens.includes(token.id)}
            isMobile={isMobile}
          />
        ))}
      </div>
    </div>
  )
} 