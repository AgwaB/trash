import React from 'react'
import { Token } from '@/types/token'
import TokenItem from './TokenItem'
import TableHeader from './TableHeader'

interface TokenListProps {
  tokens: Token[]
  selectedTokens: string[]
  onSelectToken: (tokenId: string) => void
  isMobile?: boolean
}

export default function TokenList({ tokens, selectedTokens, onSelectToken, isMobile = false }: TokenListProps) {
  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-shrink-0">
        <TableHeader isMobile={isMobile} />
      </div>
      <div className="flex-1 overflow-y-auto min-h-0 scrollbar-win98">
        {tokens.map((token, index) => (
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