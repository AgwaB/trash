import { useWallet } from '@solana/wallet-adapter-react'
import { Connection, VersionedTransaction } from '@solana/web3.js'
import { createRecycleTokenTransaction } from '@/services/contract'
import { RPC_ENDPOINT } from '@/config'
import { Decimal } from 'decimal.js'
import { Token } from '@/types/token'

const connection = new Connection(RPC_ENDPOINT, {
  commitment: 'processed',
  confirmTransactionInitialTimeout: 60000,
})

interface RecycleResult {
  success: boolean
  error?: string
  txId?: string
}

export function useRecycleTransaction() {
  const { publicKey, signTransaction } = useWallet()

  const executeRecycle = async (selectedTokenData: Token[]): Promise<RecycleResult> => {
    try {
      // 1. 입력 검증
      if (!publicKey || !signTransaction) {
        throw new Error("Wallet not connected")
      }

      // 2. 리사이클 목록 생성
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

      // 3. 트랜잭션 생성 및 실행
      const result = await createRecycleTokenTransaction(publicKey.toString(), recycleList)
      if (!result.success || !result.serializedTransaction) {
        throw new Error(result.error || "Failed to create transaction")
      }

      const tx = VersionedTransaction.deserialize(
        Buffer.from(result.serializedTransaction, 'base64')
      )

      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed')
      tx.message.recentBlockhash = blockhash

      const signedTx = await signTransaction(tx)
      
      // 4. 트랜잭션 전송 및 확인
      const txId = await connection.sendTransaction(signedTx, {
        skipPreflight: true,
        maxRetries: 3,
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
      console.error("Recycle transaction failed:", error)
      return {
        success: false,
        error: error.message || "Transaction failed"
      }
    }
  }

  return { executeRecycle }
} 