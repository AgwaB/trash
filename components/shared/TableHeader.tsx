import React from 'react'
import Image from 'next/image'

interface TableHeaderProps {
  isMobile?: boolean
}

export default function TableHeader({ isMobile = false }: TableHeaderProps) {
  return (
    <div className="flex w-full h-[39px] border-b-2 border-[#504DD7] bg-white">
      <div className="
        w-[50px] 
        bg-[#AA9ECA] 
        border-r-2 border-b-2 border-[#0A0A0A]
        flex items-center justify-center
        shadow-[inset_-2px_-2px_0px_2px_#7775BA,inset_1px_1px_0px_1px_#FFF,inset_2px_2px_0px_2px_#CDBEF8]
        px-2
      ">
        <span className="font-ms-sans text-[14px] font-[700] text-black text-center">#</span>
      </div>
      <div className="
        w-[284px] 
        bg-[#AA9ECA] 
        border-r-2 border-b-2 border-[#0A0A0A]
        flex items-center justify-center
        shadow-[inset_-2px_-2px_0px_2px_#7775BA,inset_1px_1px_0px_1px_#FFF,inset_2px_2px_0px_2px_#CDBEF8]
        px-2
      ">
        <span className="font-ms-sans text-[14px] font-[700] text-black text-center">Name</span>
      </div>
      <div className="
        w-[144px] 
        bg-[#AA9ECA] 
        border-r-2 border-b-2 border-[#0A0A0A]
        flex items-center justify-center
        shadow-[inset_-2px_-2px_0px_2px_#7775BA,inset_1px_1px_0px_1px_#FFF,inset_2px_2px_0px_2px_#CDBEF8]
        px-2
      ">
        <span className="font-ms-sans text-[14px] font-[700] text-black text-center">Description</span>
      </div>
      <div className="
        w-[70px] 
        bg-[#AA9ECA] 
        border-b-2 border-[#0A0A0A]
        flex items-center justify-center
        shadow-[inset_-2px_-2px_0px_2px_#7775BA,inset_1px_1px_0px_1px_#FFF,inset_2px_2px_0px_2px_#CDBEF8]
        px-2
      ">
        {isMobile ? (
          <div className="w-4 h-4 relative">
            <Image
              src="/icons/check.png"
              alt="Check"
              fill
              className="object-contain"
            />
          </div>
        ) : (
          <span className="font-ms-sans text-[14px] font-[700] text-black text-center">Action</span>
        )}
      </div>
    </div>
  )
} 