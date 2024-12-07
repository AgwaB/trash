import React from 'react'
import Image from 'next/image'

interface TableHeaderProps {
  isMobile?: boolean
}

export default function TableHeader({ isMobile = false }: TableHeaderProps) {
  return (
    <div className="flex w-full h-[30px] border-b-2 border-[#504DD7] bg-white">
      <div className="w-[50px] bg-[#AA9ECA] border-r border-black flex items-center justify-center
                    shadow-[inset_2px_2px_0px_#CCC0F8,inset_-3px_-3px_0px_#776EBA,inset_1px_1px_0px_#FFF]">
        <span className="font-ms-sans text-[14px] font-[700] text-black text-center">#</span>
      </div>
      <div className="w-[290px] bg-[#AA9ECA] border-r border-black flex items-center justify-center
                    shadow-[inset_2px_2px_0px_#CCC0F8,inset_-3px_-3px_0px_#776EBA,inset_1px_1px_0px_#FFF]">
        <span className="font-ms-sans text-[14px] font-[700] text-black text-center">Name</span>
      </div>
      <div className="w-[170px] bg-[#AA9ECA] border-r border-black flex items-center justify-center
                    shadow-[inset_2px_2px_0px_#CCC0F8,inset_-3px_-3px_0px_#776EBA,inset_1px_1px_0px_#FFF]">
        <span className="font-ms-sans text-[14px] font-[700] text-black text-center">Description</span>
      </div>
      <div className="w-[70px] bg-[#AA9ECA] flex items-center justify-center
                    shadow-[inset_2px_2px_0px_#CCC0F8,inset_-3px_-3px_0px_#776EBA,inset_1px_1px_0px_#FFF]">
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