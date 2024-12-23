import { Decimal } from 'decimal.js'

export enum TokenType {
  MEME = 'MEME',
  UTILITY = 'UTILITY',
  UNKNOWN = 'UNKNOWN'
}

export interface Token {
  id: string
  mint: string
  name: string
  symbol: string
  uri: string
  description: string
  imageUri?: string
  amount: string
  decimals: number
  type: TokenType
  solValue?: string
  multiplier: string
}

// Token Whitelist Description
export enum TokenDescription {
    RUG = "Rug",
    TRASH = "Trash",
    POOP = "Poop",
    GARBAGE = "Garbage",
    UTILITY_TRASH = "Utility Trash",
    SHINY_TRASH = "Shiny Trash",
    VAPORWARE = "Vaporware"
}

export interface TokenListState {
  status: 'idle' | 'loading' | 'success' | 'error';
  tokens: Token[];
  error?: string;
}
  