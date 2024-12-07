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
    <div className="w-full h-full bg-white">
      <TableHeader isMobile={isMobile} />
      <div className="w-full h-[calc(100%-30px)] overflow-y-auto">
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