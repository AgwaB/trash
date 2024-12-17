import React from 'react'
import { Token } from '@/types/token'
import TokenItem from './TokenItem'
import TableHeader from './TableHeader'
import { Decimal } from 'decimal.js'
import { calculateTotalPoints } from '@/utils/calculatePoints'

interface TokenListProps {
  tokens: Token[]
  selectedTokens: string[]
  onSelectToken: (tokenId: string) => void
  onPointsChange: (points: number) => void
  isMobile?: boolean
}

export default function TokenList({ 
  tokens, 
  selectedTokens, 
  onSelectToken, 
  onPointsChange,
  isMobile = false 
}: TokenListProps) {
  // Filter out tokens with zero amount and then sort
  const sortedTokens = [...tokens]
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

  // 선택된 토큰들의 포인트 계산
  React.useEffect(() => {
    const points = calculateTotalPoints(tokens, selectedTokens)
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
          />
        ))}
      </div>
    </div>
  )
} 