"use client"
import React from 'react'
import Image from 'next/image'

export default function Footer() {
  const [time, setTime] = React.useState(
    new Date().toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  )

  React.useEffect(() => {
    const timer = setInterval(() => {
      setTime(
        new Date().toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        })
      )
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  return (
    <footer className="h-[35px] bg-[#AA9ECA] border-t border-[#504DD7] select-none">
      <div className="flex justify-between items-center h-full px-2">
        {/* Left side - Start Button */}
        <div className="flex items-center">
          <button className="flex items-center gap-2 bg-[#AA9ECA] h-[30px] px-3
                           border border-white border-t-2 border-l-2
                           shadow-[inset_-2px_-2px_0px_rgba(0,0,0,0.25)]
                           hover:bg-[#9084B3]">
            <div className="w-4 h-3 relative">
              <Image
                src="/icons/start.png"
                alt="Start"
                fill
                className="object-contain"
              />
            </div>
            <span className="font-ms-sans text-black text-[14px] font-[700]">Start</span>
          </button>

          {/* Task Bar Items */}
          <div className="flex items-center ml-3">
            <button className="flex items-center gap-2 bg-[#AA9ECA] h-[30px] px-3
                             border border-white border-t-2 border-l-2
                             shadow-[inset_-2px_-2px_0px_rgba(0,0,0,0.25)]">
              <div className="w-4 h-4 relative">
                <Image
                  src="/icons/trash-logo.png"
                  alt="Trash.meme"
                  fill
                  className="object-contain"
                />
              </div>
              <span className="font-ms-sans text-black text-[14px]">TRASH.MEME</span>
            </button>

            <div className="ml-1">
              <button className="flex items-center gap-2 bg-[#AA9ECA] h-[30px] px-3
                               border border-white border-t-2 border-l-2
                               shadow-[inset_-2px_-2px_0px_rgba(0,0,0,0.25)]">
                <div className="w-4 h-4 relative">
                  <Image
                    src="/icons/folder.png"
                    alt="AIRDROP (REDACTED)"
                    fill
                    className="object-contain"
                  />
                </div>
                <span className="font-ms-sans text-black text-[14px]">AIRDROP (REDACTED)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right side - Time */}
        <div className="flex items-center">
          <div className="bg-[#AA9ECA] h-[30px] px-3 flex items-center
                       border border-white border-t-2 border-l-2
                       shadow-[inset_-2px_-2px_0px_rgba(0,0,0,0.25)]">
            <span className="font-ms-sans text-black text-[14px]">{time}</span>
          </div>
        </div>
      </div>
    </footer>
  )
} 