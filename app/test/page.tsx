"use client"
import { WalletContext } from '@solana/wallet-adapter-react'
import { createTestWalletContext } from '@/components/test/TestWalletProvider'
import MainWindow from '@/components/desktop/MainWindow'
import MobileMainWindow from '@/components/mobile/MobileMainWindow'

// 테스트하고 싶은 public key 입력
const TEST_PUBLIC_KEY = "5G8HqQpgmNswAyGGWvh11v9hdAZDWHMHuKGHwN5YbPkr"

export default function TestPage() {
  const testWalletContext = createTestWalletContext(TEST_PUBLIC_KEY)

  return (
    <WalletContext.Provider value={testWalletContext}>
      <div className="hidden md:block">
        <MainWindow />
      </div>
      <div className="md:hidden">
        <MobileMainWindow />
      </div>
    </WalletContext.Provider>
  )
} 