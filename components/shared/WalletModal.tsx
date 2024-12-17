"use client"
import React from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { Adapter, WalletReadyState } from '@solana/wallet-adapter-base'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface WalletModalProps {
  isOpen: boolean
  onClose: () => void
  isMobile?: boolean
}

export default function WalletModal({ isOpen, onClose, isMobile = false }: WalletModalProps) {
  const { wallets, select } = useWallet()

  if (!isOpen) return null

  const handleWalletClick = (adapter: Adapter) => {
    select(adapter.name)
    onClose()
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className={cn(
        "bg-black",
        isMobile ? "w-[350px]" : "w-[700px]"
      )}>
        {/* Title Bar */}
        <div className="h-[39px] bg-[#504DD7] flex justify-between items-center px-3
                     shadow-[inset_2px_2px_0px_rgba(129,119,156,1),inset_1px_1px_0px_rgba(255,255,255,1),inset_-3px_-3px_0px_rgba(75,73,117,1)]">
          <span className="text-white font-ms-sans font-normal text-[14px]">Connect Wallet</span>
          <button 
            onClick={onClose}
            className="w-[29px] h-[29px] bg-[#AA9ECA] hover:bg-[#9084B3] 
                     border border-white border-t-2 border-l-2
                     shadow-[inset_-2px_-2px_0px_rgba(0,0,0,0.25)]
                     flex items-center justify-center"
          >
            <span className="text-black">✕</span>
          </button>
        </div>

        <div className="flex">
          {/* Left Side - Wallet List */}
          <div className="w-[350px] bg-[#131313] p-10">
            <div className="text-[#E1E1E1] font-ms-sans font-normal text-[14px] mb-8 text-center">
              Wallet connection is required for service access.
            </div>
            <div className="flex flex-col gap-3.5 h-[356px] overflow-y-auto">
              {wallets.map(wallet => (
                <button
                  key={wallet.adapter.name}
                  onClick={() => handleWalletClick(wallet.adapter)}
                  className="flex items-center gap-4 bg-[#1F1F1F] rounded-[10px] p-4 hover:bg-[#2A2A2A] h-[60px]"
                >
                  <div className="w-[50px] h-[50px] bg-[#EEEEEE] rounded-[10px] flex items-center justify-center p-2">
                    {wallet.adapter.icon && (
                      <Image
                        src={wallet.adapter.icon}
                        alt={wallet.adapter.name}
                        width={20}
                        height={20}
                        className="w-5 h-5"
                      />
                    )}
                  </div>
                  <span className="text-[#E1E1E1] font-ms-sans font-normal text-[14px]">
                    {wallet.adapter.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Right Side - Description (Only for Desktop) */}
          {!isMobile && (
            <div className="flex-1 p-10 flex flex-col justify-center">
              <div>
                <h2 className="text-[#F5F5F5] font-ms-sans font-[700] text-[16px] mb-6 text-center">What is a Wallet?</h2>
                <div className="text-[#CACACA] font-ms-sans font-normal text-[14px] space-y-4 text-center">
                  <p>Instead of creating new accounts and passwords on every website, just connect your wallet.</p>
                  <p>Wallets are used to send, receive, store, and display digital assets like cryptocurrencies and NFTs.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 