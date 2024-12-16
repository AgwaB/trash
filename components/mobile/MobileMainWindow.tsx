"use client"
import React, { useState } from 'react'
import Image from 'next/image'
import { useWallet } from '@solana/wallet-adapter-react'
import WalletModal from '../shared/WalletModal'
import HowItWorksModal from '../shared/HowItWorksModal'
import LoadingView from '../shared/LoadingView'
import TokenList from '../shared/TokenList'
import EmptyView from '../shared/EmptyView'
import { useTokens } from '@/hooks/useTokens'
import { useVaultInfo } from '@/hooks/useVaultInfo'
import Toast from '../shared/Toast'
import { createRecycleTokenTransaction } from '@/services/contract'
import { Connection } from '@solana/web3.js'
import { RPC_ENDPOINT } from '@/config'
import { Transaction } from '@solana/web3.js'
import { BN } from '@coral-xyz/anchor'

const connection = new Connection(RPC_ENDPOINT)

export default function MobileMainWindow() {
  const { connected, publicKey, signTransaction } = useWallet()
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false)
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false)
  const [isPressed, setIsPressed] = useState(false)
  const [selectedTokens, setSelectedTokens] = useState<string[]>([])
  const [calculatedPoints, setCalculatedPoints] = useState(0)
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null)
  const { tokens, isLoading, mutate } = useTokens(publicKey?.toString())
  const { vaultInfo, isLoading: isVaultLoading } = useVaultInfo()

  const totalVolume = Number(vaultInfo.totalSolDeposited) / 1e9

  const handleTokenSelect = (tokenId: string) => {
    setSelectedTokens(prev => 
      prev.includes(tokenId) 
        ? prev.filter(id => id !== tokenId)
        : [...prev, tokenId]
    )
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
    if (!connected || selectedTokens.length === 0 || !publicKey || !signTransaction) return

    try {
      // 선택된 토큰들 가져오기
      const selectedTokenData = tokens?.filter(token => selectedTokens.includes(token.id))
      if (!selectedTokenData) return

      // 리사이클할 토큰 목록 생성
      const recycleList = selectedTokenData
        .map(token => {
          const amount = new BN(token.amount)
          const decimals = new BN(token.decimals || 0)
          const multiplier = new BN(10).pow(decimals)
          const rawAmount = amount.mul(multiplier)
          
          return {
            mint: token.mint,
            amount: rawAmount.toNumber()
          }
        })
        .filter(token => token.amount > 0)

      if (recycleList.length === 0) return

      // 트랜잭션 생성
      const result = await createRecycleTokenTransaction(publicKey.toString(), recycleList)
      if (!result.success || !result.serializedTransaction) {
        throw new Error(result.error || "트랜잭션 생성에 실패했습니다")
      }

      // base64 문자열을 Transaction으로 변환
      const tx = Transaction.from(Buffer.from(result.serializedTransaction, 'base64'))
      
      // 트랜잭션 서명
      const signedTx = await signTransaction(tx)
      
      // 트랜잭션 전송
      const signature = await connection.sendRawTransaction(signedTx.serialize())
      await connection.confirmTransaction(signature)

      setSelectedTokens([])
      setToast({
        message: "리사이클이 완료되었습니다",
        type: 'success'
      })
      
      // 토큰 목록 수동 갱신
      await mutate()
    } catch (error) {
      console.error('토큰 리사이클 중 오류:', error)
      setToast({
        message: error instanceof Error ? error.message : "리사이클에 실패했습니다",
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
    if (!tokens || tokens.length === 0) return <EmptyView />
    return (
      <TokenList
        tokens={tokens}
        selectedTokens={selectedTokens}
        onSelectToken={handleTokenSelect}
        onPointsChange={setCalculatedPoints}
        isMobile={true}
      />
    )
  }

  return (
    <>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="h-[36px] bg-[#503D9E] text-white flex-shrink-0">
          <div className="flex justify-between items-center w-full h-full px-4">
            <div className="flex items-center gap-2">
              <span className="font-ms-sans text-[16px] leading-[34px] text-[#0A0A0A]">
                Volume
              </span>
              <span className="font-ms-sans text-[16px] leading-[34px] text-[#0A0A0A]">
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
        </div>

        {/* Content */}
        <div className="flex-1 min-h-0 flex flex-col">
          <div className="flex-1 min-h-0">
            {renderContent()}
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0">
          <div className="h-[2px] border-t border-t-[#CCC0F8] border-b border-b-[#776EBA]" />
          <div className="p-4 flex flex-col items-center">
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
              className={`w-[208px] h-[38px] bg-[#503D9E] text-white font-ms-sans text-[14px] font-[700] 
                        ${isPressed ? 'bg-[#3C2D7C]' : ''} 
                        ${getButtonOpacity()}`}
              disabled={connected && (tokens?.length === 0 || selectedTokens.length === 0)}
            >
              {getButtonText()}
            </button>
          </div>
        </div>
      </div>

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