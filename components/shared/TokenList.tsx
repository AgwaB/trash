import React from 'react'
import { Token } from '@/types/token'
import TokenItem from './TokenItem'
import TableHeader from './TableHeader'
import { Decimal } from 'decimal.js'

interface TokenListProps {
  tokens: Token[]
  selectedTokens: string[]
  onSelectToken: (tokenId: string) => void
  isMobile?: boolean
}

export default function TokenList({ tokens, selectedTokens, onSelectToken, isMobile = false }: TokenListProps) {
  // 각 토큰의 총 SOL 가치(solValue * amount) 기준으로 내림차순 정렬
  const sortedTokens = [...tokens].sort((a, b) => {
    const aAmount = new Decimal(a.amount || '0')
    const bAmount = new Decimal(b.amount || '0')
    const aSolValue = new Decimal(a.solValue || '0')
    const bSolValue = new Decimal(b.solValue || '0')
    
    const aTotalValue = aSolValue.mul(aAmount)
    const bTotalValue = bSolValue.mul(bAmount)
    
    return bTotalValue.minus(aTotalValue).toNumber()
  })

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