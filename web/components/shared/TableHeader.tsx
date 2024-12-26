import React from 'react'
import Image from 'next/image'

interface TableHeaderProps {
  isMobile?: boolean
}

export default function TableHeader({ isMobile = false }: TableHeaderProps) {
  if (isMobile) {
    return (
      <div className="flex w-full h-[39px] border-b-2 border-[#504DD7] bg-white">
        <div className="w-[200px] bg-[#AA9ECA] border-r-2 border-b-2 border-[#0A0A0A] flex items-center justify-center px-4
                      shadow-[inset_-2px_-2px_0px_2px_#7775BA,inset_1px_1px_0px_1px_#FFF,inset_2px_2px_0px_2px_#CDBEF8]">
          <span className="font-ms-sans text-[14px] font-[700] text-black">Name</span>
        </div>
        <div className="w-[130px] bg-[#AA9ECA] border-r-2 border-b-2 border-[#0A0A0A] flex items-center justify-center
                      shadow-[inset_-2px_-2px_0px_2px_#7775BA,inset_1px_1px_0px_1px_#FFF,inset_2px_2px_0px_2px_#CDBEF8]">
          <span className="font-ms-sans text-[14px] font-[700] text-black">Description</span>
        </div>
        <div className="flex-1 bg-[#AA9ECA] border-b-2 border-[#0A0A0A] flex items-center justify-center
                      shadow-[inset_-2px_-2px_0px_2px_#7775BA,inset_1px_1px_0px_1px_#FFF,inset_2px_2px_0px_2px_#CDBEF8]">
          <span className="font-ms-sans text-[14px] font-[700] text-black">Recycle</span>
        </div>
      </div>
    )
  }

  // Desktop version remains unchanged
  return (
    <div className="flex w-full h-[39px] border-b-2 border-[#504DD7] bg-white">
      <div className="
        w-[230px] 
        bg-[#AA9ECA] 
        border-r-2 border-b-2 border-[#0A0A0A]
        flex items-center justify-start
        shadow-[inset_-2px_-2px_0px_2px_#7775BA,inset_1px_1px_0px_1px_#FFF,inset_2px_2px_0px_2px_#CDBEF8]
        px-4
      ">
        <span className="font-ms-sans text-[14px] font-[700] text-black">Name</span>
      </div>
      <div className="
        w-[150px] 
        bg-[#AA9ECA] 
        border-r-2 border-b-2 border-[#0A0A0A]
        flex items-center justify-end
        shadow-[inset_-2px_-2px_0px_2px_#7775BA,inset_1px_1px_0px_1px_#FFF,inset_2px_2px_0px_2px_#CDBEF8]
        px-4
      ">
        <span className="font-ms-sans text-[14px] font-[700] text-black">Amount</span>
      </div>
      <div className="
        w-[180px] 
        bg-[#AA9ECA] 
        border-r-2 border-b-2 border-[#0A0A0A]
        flex items-center justify-center
        shadow-[inset_-2px_-2px_0px_2px_#7775BA,inset_1px_1px_0px_1px_#FFF,inset_2px_2px_0px_2px_#CDBEF8]
        px-4
      ">
        <span className="font-ms-sans text-[14px] font-[700] text-black">Description</span>
      </div>
      <div className="
        w-[172px] 
        bg-[#AA9ECA] 
        border-b-2 border-[#0A0A0A]
        flex items-center justify-start
        shadow-[inset_-2px_-2px_0px_2px_#7775BA,inset_1px_1px_0px_1px_#FFF,inset_2px_2px_0px_2px_#CDBEF8]
        px-4
      ">
        <span className="font-ms-sans text-[14px] font-[700] text-black">Points</span>
      </div>
    </div>
  )
} 