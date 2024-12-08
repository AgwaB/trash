"use client"
import React from 'react'
import DesktopLayout from '@/components/desktop/layout/DesktopLayout'
import MobileLayout from '@/components/mobile/layout/MobileLayout'

export default function Home() {
  const isMobileDevice = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
  return isMobileDevice ? <MobileLayout /> : <DesktopLayout />
}
