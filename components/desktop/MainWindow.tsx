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

const connection = new Connection(RPC_ENDPOINT, {
  commitment: 'processed',
  confirmTransactionInitialTimeout: 60000,
})

export default function MainWindow() {
  const { connected, publicKey } = useWallet()
  const { points, refreshPoints } = usePoints()
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false)
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false)
  const [isPressed, setIsPressed] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [selectedTokens, setSelectedTokens] = useState<string[]>([])
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
    if (connected && (tokens?.length === 0 || selectedTokens.length === 0)) {
      return 'opacity-50'
    }
    return ''
  }

  const getButtonText = () => {
    if (!connected) return 'Connect Wallet'
    return 'Recycle'
  }

  const handleRecycleClick = async () => {
    if (!connected || selectedTokens.length === 0) return;

    try {
      setIsRecycling(true);

      const selectedTokenData = tokens?.filter(token => selectedTokens.includes(token.id));
      if (!selectedTokenData) return;

      const result = await executeRecycle(selectedTokenData);
      
      if (!result.success) {
        throw new Error(result.error);
      }

      setIsRecycling(false);

      setToast({
        message: "Recycle successful!",
        type: "success"
      });

      setLocalTokens(current => 
        current?.filter(token => !selectedTokens.includes(token.id)) || []
      );

      await Promise.all([
        mutate(),
        refreshPoints(),
        mutateVaultInfo()
      ]);
      
    } catch (error: any) {
      console.error("Recycle failed:", error);
      setToast({
        message: error.message || "Recycle failed",
        type: "error"
      });
    } finally {
      setIsRecycling(false);
      setSelectedTokens([]);
    }
  };

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
        selectedTokens={selectedTokens}
        onSelectToken={handleTokenSelect}
        onPointsChange={setCalculatedPoints}
      />
    )
  }

  return (
    <>
      <Win98Frame className="
        w-[450px] h-[600px]
        md:w-[calc(100vw-200px)]
        md:max-w-[450px]
        md:h-[calc(100vh-120px)]
        md:max-h-[600px]
        md:min-h-[400px]
        flex flex-col
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

        <Win98InnerFrame className="flex-1 min-h-0 flex flex-col">
          <Win98ContentArea className="flex-1 min-h-0">
            {renderContent()}
          </Win98ContentArea>
        </Win98InnerFrame>

        <Win98Footer className="flex-shrink-0">
          <div className="h-[2px] border-t border-t-[#CCC0F8] border-b border-b-[#776EBA]" />
          <Win98FooterContent>
            {connected && (
              <>
                <div className="font-ms-sans text-[14px] text-[#3C3987]">
                  Recycle for Points:
                </div>
                <div className="font-ms-sans text-[14px] text-black mb-2">
                  {calculatedPoints.toLocaleString()}
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
              disabled={connected && (tokens?.length === 0 || selectedTokens.length === 0)}
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
    </>
  )
} 