"use client"
import React, { useState } from 'react'
import Image from 'next/image'
import { useWallet } from '@solana/wallet-adapter-react'
import WalletModal from '../shared/WalletModal'
import WalletButton from './WalletButton'
import { usePoints } from '@/contexts/PointsContext'
import { Decimal } from 'decimal.js'

export default function Navbar() {
  const { publicKey } = useWallet()
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false)
  const [isLogoPressed, setIsLogoPressed] = useState(false)
  const { points } = usePoints()

  const formattedPoints = new Decimal(points)
    .div(new Decimal(10).pow(9))
    .toDecimalPlaces(2, Decimal.ROUND_FLOOR)
    .toString()

  const handleLogoClick = () => {
    window.location.reload()
  }

  return (
    <>
      <nav className="h-[60px] bg-[#504DA7] border-b border-[#6E6BA7]">
        <div className="flex justify-between items-center h-full px-4 md:px-12">
          {/* Left side - Logo */}
          <button
            className={`flex items-center gap-3 transition-transform border-none bg-transparent ${
              isLogoPressed ? 'scale-95' : ''
            }`}
            onClick={handleLogoClick}
            onMouseDown={() => setIsLogoPressed(true)}
            onMouseUp={() => setIsLogoPressed(false)}
            onMouseLeave={() => setIsLogoPressed(false)}
          >
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
          </button>

          {/* Right side */}
          <div className="flex items-center gap-3 md:gap-5">
            {/* Points Display */}
            <div className="w-[120px] h-[33px] bg-[#0A0A0A] relative">
              {/* Inner shadows */}
              <div className="absolute inset-0" style={{
                boxShadow: `
                  inset 3px 3px 0px rgba(33, 31, 72, 1),
                  inset 1px 1px 0px rgba(58, 56, 129, 1),
                  inset -1px -1px 0px rgba(205, 190, 248, 1)
                `
              }}>
                {/* Content container */}
                <div className="h-[33px] w-[120px] mt-[1px] flex items-center px-[15px] gap-[5px]">
                  {/* Icon */}
                  <div className="w-[29px] h-[28px] relative">
                    <Image
                      src="/icons/trash-points.png"
                      alt="Trash Points"
                      width={29}
                      height={28}
                      className="object-contain"
                    />
                  </div>
                  {/* Points value */}
                  <div className="w-[62px] h-[33px] flex items-center justify-center">
                    <span className="font-ms-sans font-normal text-[16px] leading-[30px] text-[#DFDFDF] text-center">
                      {formattedPoints}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="block md:hidden">
              <button
                onClick={() => setIsWalletModalOpen(true)}
                className="w-[35px] h-[35px] relative"
              >
                <Image
                  src="/images/wallet-default.png"
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