import { 
  PublicKey, 
  Transaction, 
  VersionedTransaction, 
  SendOptions, 
  Connection 
} from '@solana/web3.js'
import { WalletContextState } from '@solana/wallet-adapter-react'
import { MessageSignerWalletAdapterProps, WalletName } from '@solana/wallet-adapter-base'

// 테스트용 지갑 컨텍스트 생성
export const createTestWalletContext = (publicKeyStr: string): WalletContextState => {
  return {
    publicKey: new PublicKey(publicKeyStr),
    connected: true,
    connecting: false,
    disconnecting: false,
    autoConnect: true,
    wallet: null,
    wallets: [],
    select: (walletName: WalletName) => {},
    connect: async () => {},
    disconnect: async () => {},
    sendTransaction: async (
      transaction: Transaction | VersionedTransaction,
      connection: Connection,
      options?: SendOptions
    ) => { throw new Error('Not implemented') },
    signTransaction: async <T extends Transaction | VersionedTransaction>(transaction: T): Promise<T> => { 
      throw new Error('Not implemented') 
    },
    signAllTransactions: async <T extends Transaction | VersionedTransaction>(transactions: T[]): Promise<T[]> => { 
      throw new Error('Not implemented') 
    },
    signMessage: async (message: Uint8Array): Promise<Uint8Array> => { 
      throw new Error('Not implemented') 
    },
    signIn: async () => { 
      throw new Error('Not implemented') 
    }
  }
} 