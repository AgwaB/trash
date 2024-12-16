"use client"
import React, { useState } from 'react'
import Image from 'next/image'
import { useWallet } from '@solana/wallet-adapter-react'
import WalletModal from '../shared/WalletModal'
import WalletButton from './WalletButton'
import { useUserStats } from '@/hooks/useUserStats'

export default function Navbar() {
  const { publicKey } = useWallet()
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false)
  const userStats = useUserStats(publicKey?.toString())
  const points = userStats ? Number(userStats.totalPointsEarned) : 0

  return (
    <>
      <nav className="h-[60px] bg-[#503D9E] border-b border-[#6E6BA7] md:border-black">
        <div className="flex justify-between items-center h-full px-4 md:px-12">
          {/* Left side - Logo */}
          <div className="flex items-center gap-3">
            <div className="w-[35px] h-[35px] relative">
              <Image
                src="/icons/trash-logo.png"
                alt="Trash.meme logo"
                fill
                className="object-contain"
              />
            </div>
            <h1 className="text-white text-[14px] font-ms-sans font-[700]">
              Trash.meme
            </h1>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3 md:gap-5">
            <div className="bg-[#0A0A0A] px-4 py-2 rounded flex items-center gap-2 h-[35px]">
              <div className="w-4 h-4 relative">
                <Image
                  src="/icons/trash-points.png"
                  alt="Trash Points"
                  fill
                  className="object-contain"
                />
              </div>
              <span className="text-[#DFDFDF] font-ms-sans text-[14px]">
                {points.toFixed(2)}
              </span>
            </div>
            <div className="block md:hidden">
              <button
                onClick={() => setIsWalletModalOpen(true)}
                className="w-[35px] h-[35px] relative"
              >
                <Image
                  src="/images/mobile-wallet.png"
                  alt="Wallet"
                  fill
                  className="object-contain"
                />
              </button>
            </div>
            <div className="hidden md:block">
              <WalletButton onClick={() => setIsWalletModalOpen(true)} />
            </div>
          </div>
        </div>
      </nav>

      <WalletModal 
        isOpen={isWalletModalOpen} 
        onClose={() => setIsWalletModalOpen(false)} 
      />
    </>
  )
} 