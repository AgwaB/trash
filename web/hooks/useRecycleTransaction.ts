import { useWallet } from '@solana/wallet-adapter-react'
import { Connection, VersionedTransaction } from '@solana/web3.js'
import { createRecycleTokenTransaction } from '@/services/contract'
import { RPC_ENDPOINT } from '@/config'
import { Decimal } from 'decimal.js'
import { Token } from '@/types/token'
import { RecycleError, RecycleErrorCode } from '@/types/error'

const connection = new Connection(RPC_ENDPOINT, {
  commitment: 'confirmed',
  confirmTransactionInitialTimeout: 120000,
})

interface RecycleResult {
  success: boolean
  error?: string
  txId?: string
}

interface RecycleTransactionResponse {
  success: boolean
  error?: string
  code?: RecycleErrorCode
  serializedTransaction?: string
}

export function useRecycleTransaction() {
  const { publicKey, signTransaction } = useWallet()

  const executeRecycle = async (selectedTokenData: Token[]): Promise<RecycleResult> => {
    try {
      if (!publicKey || !signTransaction) {
        throw new Error("Wallet not connected")
      }

      const recycleList = selectedTokenData
        .filter(token => Number(token.amount) > 0)
        .map(token => {
          const amount = new Decimal(token.amount)
          const multiplier = new Decimal(10).pow(token.decimals || 0)
          const rawAmount = amount.mul(multiplier)
          
          return {
            mint: token.id,
            amount: rawAmount.toFixed(0)
          }
        })

      if (recycleList.length === 0) {
        throw new Error("No valid tokens selected")
      }

      const result = await createRecycleTokenTransaction(publicKey.toString(), recycleList)
      if (!result.success || !result.serializedTransaction) {
        if (result.code) {
          console.error(`error: ${JSON.stringify(result)}`)
          switch (result.code) {
            case RecycleErrorCode.NOT_SUPPORTED:
              throw new Error("This token cannot be recycled at the moment. Please try another token.");
            case RecycleErrorCode.INVALID_QUOTE:
              throw new Error("Failed to get price quote. Please try again later.");
            case RecycleErrorCode.INVALID_SWAP:
              throw new Error("Failed to create swap transaction. Please try again later.");
            default:
              throw new Error(result.error || "Unknown error occurred");
          }
        }
        throw new Error(result.error || "Failed to create transaction");
      }

      const tx = VersionedTransaction.deserialize(
        Buffer.from(result.serializedTransaction, 'base64')
      )

      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash()
      tx.message.recentBlockhash = blockhash

      const signedTx = await signTransaction(tx)
      
      const txId = await connection.sendTransaction(signedTx, {
        skipPreflight: true,
        maxRetries: 10,
        preflightCommitment: 'confirmed',
      })

      await connection.confirmTransaction({
        signature: txId,
        blockhash: blockhash,
        lastValidBlockHeight
      })

      return {
        success: true,
        txId
      }

    } catch (error: any) {
      console.error("Recycle transaction failed:", error);
      
      if (error.message?.includes('block height exceeded')) {
        return {
          success: false,
          error: 'Network is congested. Please try again.'
        }
      }

      return {
        success: false,
        error: error.message || "Transaction failed"
      };
    }
  }

  return { executeRecycle }
} 