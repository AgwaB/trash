"use client"
import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { useWallet } from '@solana/wallet-adapter-react'
import { Button } from '../shared/ui/button'
import WalletModal from '../shared/WalletModal'
import HowItWorksModal from '../shared/HowItWorksModal'
import LoadingView from '../shared/LoadingView'
import TokenList from '../shared/TokenList'
import EmptyView from '../shared/EmptyView'
import { usePoints } from '@/contexts/PointsContext'
import { Win98Frame, Win98TitleBar, Win98InnerFrame, Win98ContentArea, Win98Footer, Win98FooterContent } from '../shared/ui/win98'
import { Token } from '@/types/token'
import { fetchTokens, recycleTokens } from '@/services/token'
import Toast from '../shared/Toast'

export default function MainWindow() {
  const { connected, publicKey } = useWallet()
  const { points } = usePoints()
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false)
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false)
  const [isPressed, setIsPressed] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [tokens, setTokens] = useState<Token[]>([])
  const [selectedTokens, setSelectedTokens] = useState<string[]>([])
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null)

  useEffect(() => {
    if (connected && publicKey) {
      loadTokens()
    } else {
      setTokens([])
      setSelectedTokens([])
    }
  }, [connected, publicKey])

  const loadTokens = async () => {
    if (!publicKey) return
    
    setIsLoading(true)
    try {
      const tokenData = await fetchTokens(publicKey.toString())
      setTokens(tokenData)
    } catch (error) {
      console.error('Failed to load tokens:', error)
      setTokens([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleTokenSelect = (tokenId: string) => {
    setSelectedTokens(prev => 
      prev.includes(tokenId) 
        ? prev.filter(id => id !== tokenId)
        : [...prev, tokenId]
    )
  }

  const getButtonImage = () => {
    if (isPressed) return '/images/recycle-pressed.png'
    if (isHovered) return '/images/recycle-focus.png'
    return '/images/recycle.png'
  }

  const getButtonOpacity = () => {
    if (connected && (tokens.length === 0 || selectedTokens.length === 0)) {
      return 'opacity-50'
    }
    return ''
  }

  const getButtonText = () => {
    if (!connected) return 'Connect Wallet'
    return 'Recycle'
  }

  const handleRecycleClick = async () => {
    if (!connected || selectedTokens.length === 0) return

    try {
      // TODO: 성공 여부 확인 후 list 변경
      await recycleTokens(selectedTokens)
      setToast({
        message: "Recycle completed",
        type: 'success'
      })
      // 토큰 목록 새로고침
      loadTokens()
      // 선택 초기화
      setSelectedTokens([])
    } catch (error) {
      setToast({
        message: "Recycle failed",
        type: 'error'
      })
    }
  }

  const renderContent = () => {
    if (!connected) {
      return (
        <div className="flex flex-col items-center justify-center h-full">
          <div className="flex-1 flex items-center justify-center w-full">
            <Image
              src="/images/character.gif"
              alt="Trash Character"
              width={390}
              height={190}
              className="object-contain"
              unoptimized
            />
          </div>
          <div className="text-center text-base mb-6">
            Throw away your worthless tokens.<br />
            We recycle them to even more worthless points.
          </div>
        </div>
      )
    }

    if (isLoading) return <LoadingView />
    if (tokens.length === 0) return <EmptyView />
    return (
      <TokenList
        tokens={tokens}
        selectedTokens={selectedTokens}
        onSelectToken={handleTokenSelect}
      />
    )
  }

  return (
    <>
      <Win98Frame className="h-full flex flex-col">
        <Win98TitleBar className="h-[36px] bg-[#503D9E] text-white shrink-0">
          <div className="flex justify-between items-center w-full">
            <div className="text-base leading-8 font-[700] pl-5">
              Volume - {points} SOL
            </div>
            <div className="flex items-center">
              <div 
                className="text-base leading-6 underline cursor-pointer mr-3"
                onClick={() => setIsHowItWorksOpen(true)}
              >
                How it works
              </div>
              <div className="pr-[3px]">
                <button
                  onClick={() => setIsHowItWorksOpen(true)}
                  className="w-[29px] h-[29px] bg-[#AA9ECA] flex items-center justify-center
                            border border-white border-t-2 border-l-2
                            shadow-[inset_-2px_-2px_0px_rgba(0,0,0,0.25)]
                            hover:bg-[#9084B3] 
                            active:border-b-2 active:border-r-2 active:border-t-0 active:border-l-0 
                            active:shadow-[inset_2px_2px_0px_rgba(0,0,0,0.25)]"
                >
                  <div className="w-4 h-4 relative">
                    <Image
                      src="/icons/question.png"
                      alt="Help"
                      fill
                      className="object-contain"
                    />
                  </div>
                </button>
              </div>
            </div>
          </div>
        </Win98TitleBar>

        <Win98InnerFrame className="flex-1 min-h-0">
          <Win98ContentArea className="mx-[2px] my-[6px] h-[calc(100%-12px)] bg-white border-[#0A0A0A] border-[2px] flex flex-col">
            {renderContent()}
          </Win98ContentArea>
        </Win98InnerFrame>

        <Win98Footer>
          <div className="h-[2px] border-t border-t-[#CCC0F8] border-b border-b-[#776EBA]" />
          <Win98FooterContent>
            {connected && (
              <>
                <div className="font-ms-sans text-[14px] text-[#3C3987]">
                  Recycle for Points:
                </div>
                <div className="font-ms-sans text-[14px] text-black mb-2">
                  {points}
                </div>
              </>
            )}
            <button
              onClick={() => {
                if (!connected) {
                  setIsWalletModalOpen(true)
                } else if (selectedTokens.length > 0) {
                  handleRecycleClick()
                }
              }}
              onMouseDown={() => setIsPressed(true)}
              onMouseUp={() => setIsPressed(false)}
              onMouseLeave={() => {
                setIsPressed(false)
                setIsHovered(false)
              }}
              onMouseEnter={() => setIsHovered(true)}
              className="relative w-[208px] h-[38px] flex items-center justify-center"
              disabled={connected && (tokens.length === 0 || selectedTokens.length === 0)}
            >
              <Image
                src={getButtonImage()}
                alt="Action Button"
                width={208}
                height={38}
                className={`object-contain ${getButtonOpacity()}`}
              />
              <span className="absolute inset-0 flex items-center justify-center 
                            font-ms-sans text-[14px] text-white font-[700]">
                {getButtonText()}
              </span>
            </button>
          </Win98FooterContent>
        </Win98Footer>
      </Win98Frame>

      <WalletModal 
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
      />

      <HowItWorksModal
        isOpen={isHowItWorksOpen}
        onClose={() => setIsHowItWorksOpen(false)}
      />

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  )
} 