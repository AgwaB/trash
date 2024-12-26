"use client"
import React, { useState } from 'react'
import Image from 'next/image'
import { useWallet } from '@solana/wallet-adapter-react'
import WalletModal from '../shared/WalletModal'
import { usePoints } from '@/contexts/PointsContext'
import { Decimal } from 'decimal.js'

export default function MobileNavbar() {
  const { connected, disconnect } = useWallet()
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false)
  const { points } = usePoints()

  const formattedPoints = new Decimal(points)
    .div(new Decimal(10).pow(9))
    .toFixed(2)
    .replace(/\.?0+$/, '');

  const handleWalletClick = () => {
    if (connected) {
      disconnect()
    } else {
      setIsWalletModalOpen(true)
    }
  }

  return (
    <>
      <nav className="h-[60px] bg-[#504DA7] border-b border-[#6E6BA7]">
        <div className="flex justify-between items-center h-full px-4">
          {/* Left side - Logo */}
          <div className="flex items-center gap-3">
            <div className="w-[35px] h-[42px] relative">
              <Image
                src="/icons/trash-logo.png"
                alt="Trash.meme logo"
                fill
                className="object-contain"
              />
            </div>
            <h1 className="text-white text-[20px] font-ms-sans font-bold">
              Trash.meme
            </h1>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <div className="bg-[#0A0A0A] px-4 py-2 rounded flex items-center gap-2 w-[110px] h-[36px]">
              <div className="w-[21px] h-[21px] relative">
                <Image
                  src="/icons/trash-points.png"
                  alt="Trash Points"
                  width={21}
                  height={21}
                  className="object-contain"
                />
              </div>
              <span className="text-[#DFDFDF] leading-8 font-ms-sans font-bold text-[12px]">
                {formattedPoints}
              </span>
            </div>
            <button
              onClick={handleWalletClick}
              className="w-[35px] h-[35px] relative"
            >
              <Image
                src={"/images/mobile-wallet.png"}
                alt="Wallet"
                fill
                className="object-contain"
              />
            </button>
          </div>
        </div>
      </nav>

      <WalletModal 
        isOpen={isWalletModalOpen} 
        onClose={() => setIsWalletModalOpen(false)}
        isMobile={true}
      />
    </>
  )
} 