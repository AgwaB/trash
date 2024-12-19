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
import LoadingModal from '../shared/LoadingModal'

const connection = new Connection(RPC_ENDPOINT)

export default function MobileMainWindow() {
  const { connected, publicKey, signTransaction } = useWallet()
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false)
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false)
  const [isPressed, setIsPressed] = useState(false)
  const [selectedTokens, setSelectedTokens] = useState<string[]>([])
  const [calculatedPoints, setCalculatedPoints] = useState<string>('0')
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null)
  const { tokens, isLoading, mutate } = useTokens(publicKey?.toString())
  const { vaultInfo, isLoading: isVaultLoading } = useVaultInfo()
  const [isRecycling, setIsRecycling] = useState(false)

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

  const getButtonImage = () => {
    if (!connected) {
      return '/images/recycle.png'
    }
    return isRecycling ? '/images/mobile-recycle-pressed.png' : '/images/mobile-recycle.png'
  }

  const handleRecycleClick = async () => {
    if (!connected || selectedTokens.length === 0 || !publicKey || !signTransaction) return

    try {
      // 선택된 토큰들 가져오기
      const selectedTokenData = tokens?.filter(token => selectedTokens.includes(token.id))
      if (!selectedTokenData) return

      // 리사이클할 토큰 목록 생성
      const recycleList = selectedTokenData
        .filter(token => Number(token.amount) > 0)
        .map(token => {
          const amount = BigInt(token.amount)
          const decimals = BigInt(token.decimals || 0)
          const multiplier = BigInt(10) ** decimals
          const rawAmount = amount * multiplier
          
          return {
            mint: token.id,
            amount: rawAmount.toString()
          }
        })

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
      
      // 트랜잭션 전송 전에 모달 표시
      setIsRecycling(true)

      try {
        // 트랜잭션 전송
        const signature = await connection.sendRawTransaction(signedTx.serialize())
        
        // 트랜잭션 확인 대기
        await connection.confirmTransaction(signature)
        
        // 트랜잭션이 성공적으로 완료됨
        setSelectedTokens([])
        setToast({
          message: "리사이클이 완료되었습니다",
          type: 'success'
        })

        // 토큰 목록 새로고침
        await mutate()
      } catch (error) {
        throw error
      } finally {
        // 모달과 로딩 상태 해제
        setIsRecycling(false)
      }

    } catch (error) {
      console.error('토큰 리사이클 중 오류:', error)
      setToast({
        message: error instanceof Error ? error.message : "리사이클에 실패했습니다",
        type: 'error'
      })
      // 에러 발생 시에도 상태 초기화
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
    
    // 토큰 필터링
    const validTokens = tokens?.filter(token => 
      Number(token.amount) > 0
      // && (token.solValue && Number(token.solValue) > 0)
      // TODO: and price > 0
    )
    
    if (!validTokens || validTokens.length === 0) return <EmptyView />
    
    return (
      <TokenList
        tokens={validTokens}
        selectedTokens={selectedTokens}
        onSelectToken={handleTokenSelect}
        onPointsChange={setCalculatedPoints}
        isMobile={true}
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
            {connected && (
              <>
                <div className="font-ms-sans font-normal text-[16px] text-[#AA9ECA]">
                  Recycle for Points:
                </div>
                <div className="font-ms-sans font-bold text-[16px] text-[#FEFEFE] mb-2">
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
              className="relative w-[240px] h-[50px] flex items-center justify-center"
              disabled={isRecycling || (connected && (tokens?.length === 0 || selectedTokens.length === 0))}
            >
              <Image
                src={getButtonImage()}
                alt="Action Button"
                width={240}
                height={50}
                className={`object-contain ${getButtonOpacity()}`}
              />
              <span className="absolute inset-0 flex items-center justify-center 
                 font-ms-sans text-[14px] text-white font-[700]">
                {isRecycling ? 'Processing...' : getButtonText()}
              </span>
            </button>
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

      <LoadingModal 
        isOpen={isRecycling} 
        onClose={() => setIsRecycling(false)}
      />
    </>
  )
} 