// Server-side only configuration
// This file should only be imported in server actions and API routes

export const RPC_ENDPOINT = process.env.RPC_ENDPOINT!

if (!RPC_ENDPOINT) {
  throw new Error('RPC_ENDPOINT environment variable is not set')
}