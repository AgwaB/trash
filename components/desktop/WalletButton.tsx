"use client"
import React, { useState } from 'react'
import Image from 'next/image'
import { useWallet } from '@solana/wallet-adapter-react'

interface WalletButtonProps {
  onClick: () => void
}

export default function WalletButton({ onClick }: WalletButtonProps) {
  const { connected, publicKey, disconnect } = useWallet()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isPressed, setIsPressed] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [isDisconnectPressed, setIsDisconnectPressed] = useState(false)
  const [isDisconnectHovered, setIsDisconnectHovered] = useState(false)
  
  const formatWalletAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`
  }

  const getButtonImage = () => {
    if (!connected) {
      if (isPressed) return '/images/wallet-pressed.png'
      if (isHovered) return '/images/wallet-focus.png'
      return '/images/wallet-default.png'
    } else {
      if (isDropdownOpen) return '/images/wallet-connected-up.png'
      return '/images/wallet-connected-down.png'
    }
  }

  const getDisconnectButtonImage = () => {
    if (isDisconnectPressed) return '/images/wallet-pressed.png'
    if (isDisconnectHovered) return '/images/wallet-focus.png'
    return '/images/wallet-default.png'
  }

  return (
    <div className="relative">
      <button
        onClick={() => {
          if (connected) {
            setIsDropdownOpen(!isDropdownOpen)
          } else {
            onClick()
          }
        }}
        onMouseDown={() => setIsPressed(true)}
        onMouseUp={() => setIsPressed(false)}
        onMouseLeave={() => {
          setIsPressed(false)
          setIsHovered(false)
        }}
        onMouseEnter={() => setIsHovered(true)}
        className="relative w-[150px] h-[35px] flex items-center justify-center"
      >
        <Image
          src={getButtonImage()}
          alt="Wallet Button"
          width={150}
          height={35}
          className="object-contain"
        />
        <span className={`absolute inset-0 flex items-center justify-center 
                      font-ms-sans text-[14px] text-black font-[700] ${connected && publicKey ? 'pr-4' : ''}`}>
          {connected && publicKey 
            ? formatWalletAddress(publicKey.toBase58())
            : 'Connect Wallet'
          }
        </span>
      </button>

      {isDropdownOpen && connected && (
        <div className="absolute top-full right-0 mt-1">
          <button
            onClick={() => {
              disconnect()
              setIsDropdownOpen(false)
            }}
            onMouseDown={() => setIsDisconnectPressed(true)}
            onMouseUp={() => setIsDisconnectPressed(false)}
            onMouseLeave={() => {
              setIsDisconnectPressed(false)
              setIsDisconnectHovered(false)
            }}
            onMouseEnter={() => setIsDisconnectHovered(true)}
            className="relative w-[150px] h-[35px] flex items-center justify-center"
          >
            <Image
              src={getDisconnectButtonImage()}
              alt="Disconnect Button"
              width={150}
              height={35}
              className="object-contain"
            />
            <span className="absolute inset-0 flex items-center justify-center 
                          font-ms-sans text-[14px] text-black font-[700]">
              Disconnect
            </span>
          </button>
        </div>
      )}
    </div>
  )
} 