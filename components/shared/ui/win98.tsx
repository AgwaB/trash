import * as React from "react"
import { cn } from "@/lib/utils"

// 1. 외부 보드 (가장 바깥쪽 프레임)
const Win98Frame = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex flex-col max-w-[650px]",
      "bg-[#AA9ECA] p-1",
      // 외부 테두리 효과
      "relative",
      "border-2 border-[#776EBA]",
      // 내부 그림자와 하이라이트
      "before:absolute before:content-[''] before:inset-0",
      "before:border before:border-t-white before:border-l-white",
      "before:border-r-[#504DD7] before:border-b-[#504DD7]",
      "before:border-2",
      "before:pointer-events-none",
      // 외부 그림자
      "shadow-[4px_4px_10px_rgba(0,0,0,0.35)]",
      className
    )}
    {...props}
  />
))
Win98Frame.displayName = "Win98Frame"

// 2. 타이틀바 (독립적인 컴포넌트)
const Win98TitleBar = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex justify-between items-center",
      "py-1 w-full",
      "bg-[#504DD7] min-h-[36px]",
      // 타이틀바 테두리
      "relative border border-[#504DD7]",
      "before:absolute before:content-[''] before:inset-0",
      "before:border before:border-t-white/40 before:border-l-white/40",
      "before:border-r-black/25 before:border-b-black/25",
      "before:pointer-events-none",
      // 텍스트 스타일
      "text-white",
      className
    )}
    {...props}
  />
))
Win98TitleBar.displayName = "Win98TitleBar"

// 3. 내부 보드 (흰색 배경, 검은색 테두리)
const Win98InnerFrame = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
        "flex flex-col flex-grow",
        "bg-[#AA9ECA] p-1.5 mt-0",
        // 가장 바깥 테두리
        // "border-[2px] border-[#504DD7]",
        // 두 번째 테두리
        "relative",
        "before:absolute before:content-[''] before:inset-[2px]",
        "before:border-[2px]",
        "before:border before:border-t-[#D8D0F0] before:border-l-[#D8D0F0]",
        "before:border-r-[#776EBA] before:border-b-[#776EBA]",
        "before:pointer-events-none",
        // 세 번째 테두리
        "after:absolute after:content-[''] after:inset-[4px]",
        "after:border-[2px] after:border-[#AA9ECA]",
        "after:pointer-events-none",
      className
    )}
    {...props}
  />
))
Win98InnerFrame.displayName = "Win98InnerFrame"

// 4. 실제 콘텐츠 영역 (흰 배경, 검은색 테두리)
const Win98ContentArea = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "mx-[2px] bg-white border-[#0A0A0A] border-[2px] flex flex-col overflow-hidden",
      className
    )}
    {...props}
  />
))
Win98ContentArea.displayName = "Win98ContentArea"

// 테이블 헤더 컨헴포넌트
const Win98TableHeaderCell = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "bg-[#AA9ECA] border-r border-black flex items-center justify-center",
      "shadow-[inset_2px_2px_2px_#CCC0F8,inset_1px_1px_1px_#FFFFFF,inset_-3px_-3px_3px_#776EBA]",
      "font-ms-sans text-[14px] text-black",
      className
    )}
    {...props}
  />
))
Win98TableHeaderCell.displayName = "Win98TableHeaderCell"

// 테이블 헤 컨테이너
const Win98TableHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex w-full h-[40px] border-b-2 border-[#504DD7] bg-white",
      className
    )}
    {...props}
  />
))
Win98TableHeader.displayName = "Win98TableHeader"

// 리사이클 버튼 컴포넌트
const Win98RecycleButton = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "bg-[#504DD7] h-[38px] px-8 text-white font-ms-sans text-[14px]",
      "border border-[#776EBA] border-t-2 border-l-2",
      "shadow-[inset_3px_3px_0px_#CCC0F8,inset_1px_1px_0px_#FFFFFF,inset_-3px_-3px_0px_#3C395C,inset_-1px_-1px_0px_#000000]",
      "hover:bg-[#5D5AE0] active:shadow-[inset_2px_2px_0px_rgba(0,0,0,0.25)]",
      "disabled:opacity-50 disabled:cursor-not-allowed",
      className
    )}
    {...props}
  />
))
Win98RecycleButton.displayName = "Win98RecycleButton"

// 테이블 셀 컴포넌트
const Win98TableCell = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    isSelected?: boolean
  }
>(({ className, isSelected, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "border-b border-[#DFDFDF]",
      isSelected ? "bg-[#333096] text-white" : "bg-white text-[#0A0A0A] hover:bg-[#333096] hover:text-white",
      "transition-colors duration-100",
      className
    )}
    {...props}
  />
))
Win98TableCell.displayName = "Win98TableCell"

const Win98Footer = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative bg-[#AA9ECA] h-[100px] flex flex-col shrink-0",
    //   "border-2 border-[#504DD7]",
      "before:absolute before:content-[''] before:inset-0",
      "before:border" ,
      "before:border-r-white/40 before:border-b-white/40",
      "before:border-t-[#776EBA] before:border-l-[#776EBA]",
      "before:pointer-events-none",
      className
    )}
    {...props}
  />
))
Win98Footer.displayName = "Win98Footer"

const Win98FooterContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex-1 flex flex-col items-center justify-center",
    //   "border-2 border-[#776EBA] mx-[1px] my-[1px]",
      "relative",
      "before:absolute before:content-[''] before:inset-0",
    //   "before:border-r-white/40 before:border-b-white/40",
    //   "before:border-t-[#776EBA] before:border-l-[#776EBA]",
      "before:pointer-events-none",
      className
    )}
    {...props}
  />
))
Win98FooterContent.displayName = "Win98FooterContent"

export {
  Win98Frame,
  Win98TitleBar,
  Win98InnerFrame,
  Win98ContentArea,
  Win98TableHeaderCell,
  Win98TableHeader,
  Win98RecycleButton,
  Win98TableCell,
  Win98Footer,
  Win98FooterContent
} 