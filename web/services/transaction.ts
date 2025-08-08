"use server"
import { Connection, VersionedTransaction } from '@solana/web3.js'
import { RPC_ENDPOINT } from '@/config/server'

const connection = new Connection(RPC_ENDPOINT, {
  commitment: 'confirmed',
  confirmTransactionInitialTimeout: 120000,
})

export async function getLatestBlockhash() {
  return await connection.getLatestBlockhash()
}

export async function sendAndConfirmTransaction(
  serializedTransaction: string,
  blockhash: string,
  lastValidBlockHeight: number
) {
  try {
    const tx = VersionedTransaction.deserialize(
      Buffer.from(serializedTransaction, 'base64')
    )
    
    const txId = await connection.sendTransaction(tx, {
      skipPreflight: false,
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
    console.error("Transaction failed:", error)
    
    if (error.message?.includes('block height exceeded')) {
      return {
        success: false,
        error: 'Network is congested. Please try again.'
      }
    }

    return {
      success: false,
      error: error.message || "Transaction failed"
    }
  }
}