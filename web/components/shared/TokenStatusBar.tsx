import React from 'react'

interface TokenStatusBarProps {
  tokenCount: number | null
}

export default function TokenStatusBar({ tokenCount }: TokenStatusBarProps) {
  return (
    <div className="
        border-2 border-[#7775BA]
        relative
        before:absolute before:content-[''] before:inset-0
        before:border-t-[#7775ba] before:border-l-[#7775ba]
        before:border-t-2 before:border-l-2
        before:pointer-events-none
        after:absolute after:content-[''] after:inset-0
        after:border-r-[#CDBEF8] after:border-b-[#CDBEF8]
        after:border-r-2 after:border-b-2
        after:pointer-events-none
    ">
      <span className="
        font-ms-sans 
        font-bold
        text-[16px] 
        text-[#504DA7]
        leading-[33px]
        pl-[10px]
      ">
        Your Garbage Tokens ({tokenCount === null ? '-' : tokenCount.toLocaleString()})
      </span>
    </div>
  )
}
