import { PublicKey } from '@solana/web3.js'

// Program IDs
export const PROGRAM_ID = new PublicKey(process.env.NEXT_PUBLIC_PROGRAM_ID!)
export const TOKEN_PROGRAM_ID = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA")
export const TOKEN_2022_PROGRAM_ID = new PublicKey("TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb")

// RPC Endpoint
export const RPC_ENDPOINT = process.env.NEXT_PUBLIC_RPC_ENDPOINT!

// Seeds
export const SEEDS = {
  ADMIN: 'ADMIN',
  VAULT: 'VAULT',
  LABEL: 'LABEL',
  USER_STATS: 'USER_STATS',
  RECYCLE_DATA: 'RECYCLE_DATA',
  TREASURY: 'TREASURY'
} as const

// Other constants
export const WSOL_MINT = "So11111111111111111111111111111111111111112" 