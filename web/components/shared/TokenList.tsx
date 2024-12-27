import React from 'react'
import TokenItem from './TokenItem'
import { Token } from '@/types/token'
import { calculateTotalPoints } from '@/utils/calculatePoints'
import { calculateTokenPoints } from '@/utils/calculatePoints'
import TableHeader from './TableHeader'

interface TokenListProps {
  tokens: Token[]
  onPointsChange: (points: string) => void
  isMobile: boolean
  onRecycle: (tokens: Token[]) => void
}

export default function TokenList({ 
  tokens, 
  onPointsChange,
  isMobile,
  onRecycle 
}: TokenListProps) {

  React.useEffect(() => {
    if (!tokens || tokens.length === 0) {
      onPointsChange('0')
      return
    }
    const points = calculateTotalPoints(tokens, tokens.map(t => t.id))
    onPointsChange(points)
  }, [tokens, onPointsChange])

  const sortedTokens = [...tokens].sort((a, b) => {
    const pointsA = Number(calculateTokenPoints(a))
    const pointsB = Number(calculateTokenPoints(b))
    return pointsB - pointsA
  })

  return (
    <div className="flex flex-col w-full h-full">
      <TableHeader isMobile={isMobile} />
      <div className="flex-1 overflow-y-auto overflow-x-visible">
        <div className="relative">
          {sortedTokens.map((token, index) => (
            <TokenItem
              key={token.id}
              token={token}
              index={index}
              isMobile={isMobile}
              onRecycle={onRecycle}
            />
          ))}
        </div>
      </div>
    </div>
  )
} 