import { updateExpiredPrices } from '@/services/token'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    await updateExpiredPrices()
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
} 