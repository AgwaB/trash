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
import { Win98Frame, Win98TitleBar, Win98InnerFrame, Win98ContentArea, Win98Footer, Win98FooterContent } from '../shared/ui/win98'
import Toast from '../shared/Toast'
import { useTokens } from '@/hooks/useTokens'
import { useVaultInfo } from '@/hooks/useVaultInfo'
import { createRecycleTokenTransaction } from '@/services/contract'
import { Connection, VersionedTransaction } from '@solana/web3.js'
import { RPC_ENDPOINT } from '@/config'
import { Transaction } from '@solana/web3.js'
import LoadingModal from '../shared/LoadingModal'
import { Decimal } from 'decimal.js';
import { Token } from '@/types/token'
import { useRecycleTransaction } from '@/hooks/useRecycleTransaction'
import TokenStatusBar from '../shared/TokenStatusBar'

export default function MainWindow() {
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

  const handleRecycleClick = async (tokens: Token[]) => {
    if (!connected) {
      setIsWalletModalOpen(true)
      return
    }

    try {
      setIsRecycling(true)
      const result = await executeRecycle(tokens)
      
      if (!result.success) {
        throw new Error(result.error)
      }

      setToast({
        message: "Recycle successful!",
        type: "success"
      })

      setIsRecycling(false) // 조금 더 빠르게 렌더링 되도록

      setLocalTokens(current => 
        current?.filter(t => !tokens.find(st => st.id === t.id)) || []
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
    const validTokens = (localTokens || tokens)?.filter(token => 
      Number(token.amount) > 0
      && (token.solValue && Number(token.solValue) > 0)
    ) || []

    return (
      <Win98InnerFrame className="flex-1 min-h-0 flex flex-col overflow-visible">
        <TokenStatusBar 
          tokenCount={
            !connected ? 0 : 
            isLoading ? null : 
            validTokens.length
          } 
        />
        <Win98ContentArea className="flex-1 min-h-0 overflow-visible">
          {!connected ? (
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
          ) : isLoading ? (
            <LoadingView />
          ) : !validTokens || validTokens.length === 0 ? (
            <EmptyView />
          ) : (
            <TokenList
              tokens={validTokens}
              onPointsChange={setCalculatedPoints}
              isMobile={false}
              onRecycle={handleRecycleClick}
            />
          )}
        </Win98ContentArea>
      </Win98InnerFrame>
    )
  }

  return (
    <div className="flex justify-center items-start w-full h-full">
      <Win98Frame className="
        w-[450px] h-[600px]
        md:w-[calc(100vw-200px)]
        md:max-w-[732px]
        md:h-[calc(100vh-120px)]
        md:max-h-[600px]
        md:min-h-[400px]
        flex flex-col
        overflow-visible
        relative
      ">
        <Win98TitleBar className="h-[36px] bg-[#503D9E] text-white flex-shrink-0">
          <div className="flex justify-between items-center w-full">
            <div className="flex items-center gap-2 ml-4">
              <span className="font-ms-sans text-[16px] leading-[33px] text-[#FEFEFE] font-bold">
                Volume
              </span>
              <span className="font-ms-sans text-[16px] leading-[33px] text-[#FEFEFE] font-bold">
                {isVaultLoading ? "Loading..." : `${totalVolume.toFixed(4)} SOL`}
              </span>
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
        
        {renderContent()}

        <Win98Footer className="flex-shrink-0">
          <div className="h-[2px] border-t border-t-[#CCC0F8] border-b border-b-[#776EBA]" />
          <Win98FooterContent>
            {connected ? (
              <>
                <div className="font-ms-sans text-[14px] text-[#3C3987]">
                  Maximum Points You Can Recycle:
                </div>
                <div className="font-ms-sans text-[14px] text-black mb-2">
                  {isLoading ? '-' : calculatedPoints.toLocaleString()}
                </div>
              </>
            ) : (
              <button
                onClick={() => setIsWalletModalOpen(true)}
                className="relative w-[208px] h-[38px] flex items-center justify-center"
              >
                <Image
                  src="/images/recycle.png"
                  alt="Connect Wallet"
                  width={208}
                  height={38}
                  className="object-contain"
                />
                <span className="absolute inset-0 flex items-center justify-center 
                              font-ms-sans text-[14px] text-white font-[700]">
                  Connect Wallet
                </span>
              </button>
            )}
          </Win98FooterContent>
        </Win98Footer>
      </Win98Frame>

      <WalletModal 
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        isMobile={false}
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

      <LoadingModal 
        isOpen={isRecycling} 
        onClose={() => setIsRecycling(false)}
      />
    </div>
  )
} 