"use client"
import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { useWallet } from '@solana/wallet-adapter-react'
import WalletModal from '../shared/WalletModal'
import HowItWorksModal from '../shared/HowItWorksModal'
import LoadingView from '../shared/LoadingView'
import TokenList from '../shared/TokenList'
import EmptyView from '../shared/EmptyView'
import { usePoints } from '@/contexts/PointsContext'
import Toast from '../shared/Toast'
import { useTokens } from '@/hooks/useTokens'
import { useVaultInfo } from '@/hooks/useVaultInfo'
import LoadingModal from '../shared/LoadingModal'
import { Token } from '@/types/token'
import { useRecycleTransaction } from '@/hooks/useRecycleTransaction'

export default function MobileMainWindow() {
  const { connected, publicKey } = useWallet()
  const { points, refreshPoints } = usePoints()
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false)
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false)
  const [isPressed, setIsPressed] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [calculatedPoints, setCalculatedPoints] = useState<string>('0')
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null)
  const { tokens, isLoading, mutate } = useTokens(publicKey?.toString())
  const { vaultInfo, isLoading: isVaultLoading, mutateVaultInfo } = useVaultInfo()
  const [isRecycling, setIsRecycling] = useState(false)
  const [localTokens, setLocalTokens] = useState<Token[] | null>(null)
  const { executeRecycle } = useRecycleTransaction()

  useEffect(() => {
    setLocalTokens(tokens)
  }, [tokens])

  const totalVolume = Number(vaultInfo.totalSolDeposited) / 1e9

  const getButtonImage = () => {
    if (isPressed) return '/images/recycle-pressed.png'
    if (isHovered) return '/images/recycle-focus.png'
    return '/images/recycle.png'
  }

  const getButtonOpacity = () => {
    if (connected && tokens?.length === 0) {
      return 'opacity-50'
    }
    return ''
  }

  const getButtonText = () => {
    if (!connected) return 'Connect Wallet'
    return 'Recycle'
  }

  const handleRecycleClick = async (selectedTokens: Token[]) => {
    if (!connected) {
      setIsWalletModalOpen(true)
      return
    }

    try {
      setIsRecycling(true)

      const result = await executeRecycle(selectedTokens)
      
      if (!result.success) {
        throw new Error(result.error)
      }

      setToast({
        message: "Recycle successful!",
        type: "success"
      })

      setLocalTokens(current => 
        current?.filter(t => !selectedTokens.find(st => st.id === t.id)) || []
      )

      await Promise.all([
        mutate(),
        refreshPoints(),
        mutateVaultInfo()
      ])
      
    } catch (error: any) {
      console.error("Recycle failed:", error)
      setToast({
        message: error.message || "Recycle failed",
        type: "error"
      })
    } finally {
      setIsRecycling(false)
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
    
    const validTokens = (localTokens || tokens)?.filter(token => 
      Number(token.amount) > 0
      && (token.solValue && Number(token.solValue) > 0)
    )
    
    if (!validTokens || validTokens.length === 0) return <EmptyView />
    
    return (
      <TokenList
        tokens={validTokens}
        onPointsChange={setCalculatedPoints}
        isMobile={true}
        onRecycle={handleRecycleClick}
      />
    )
  }

  return (
    <>
      <div className="flex flex-col h-full bg-[#504DA7]">
        {/* Header */}
        <div className="h-[48px] flex-shrink-0">
          <div className="flex justify-between items-center w-full h-full px-4">
            <div className="flex items-center gap-2">
              <span className="font-ms-sans text-[16px] leading-[33px] text-[#FEFEFE] font-bold">
                Volume
              </span>
              <span className="font-ms-sans text-[16px] leading-[33px] text-[#FEFEFE] font-bold">
                {isVaultLoading ? "Loading..." : `${totalVolume.toFixed(4)} SOL`}
              </span>
            </div>
            <div className="flex items-center">
              <div 
                className="text-[16px] leading-6 underline cursor-pointer mr-3 text-white"
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
        </div>

        {/* Content */}
        <div className="flex-1 min-h-0 flex flex-col bg-white mx-1">
          <div className="flex-1 min-h-0">
            {renderContent()}
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 bg-[#504DA7] mx-1 mb-1">
          <div className="h-[2px] border-t border-t-[#CCC0F8] border-b border-b-[#776EBA]" />
          <div className="p-4 flex flex-col items-center">
            {connected ? (
              <>
                <div className="font-ms-sans font-normal text-[16px] text-[#AA9ECA] flex items-center gap-2">
                  <div className="w-[18px] h-[18px] relative">
                    <Image
                      src="/icons/mobile-trash.png"
                      alt="Trash"
                      fill
                      className="object-contain"
                    />
                  </div>
                  Recycle for Points:
                </div>
                <div className="font-ms-sans font-bold text-[16px] text-[#FEFEFE]">
                  {calculatedPoints.toLocaleString()}
                </div>
              </>
            ) : (
              <button
                onClick={() => setIsWalletModalOpen(true)}
                onMouseDown={() => setIsPressed(true)}
                onMouseUp={() => setIsPressed(false)}
                className="relative w-[240px] h-[50px] flex items-center justify-center"
              >
                <Image
                  src={getButtonImage()}
                  alt="Action Button"
                  width={240}
                  height={50}
                  className="object-contain"
                />
                <span className="absolute inset-0 flex items-center justify-center 
                   font-ms-sans text-[14px] text-white font-[700]">
                  Connect Wallet
                </span>
              </button>
            )}
          </div>
        </div>
      </div>

      <WalletModal 
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        isMobile={true}
      />

      <HowItWorksModal
        isOpen={isHowItWorksOpen}
        onClose={() => setIsHowItWorksOpen(false)}
        isMobile={true}
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