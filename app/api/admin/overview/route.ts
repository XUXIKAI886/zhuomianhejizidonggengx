import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    const stats = await DatabaseService.getSystemOverview()
    
    return NextResponse.json({
      success: true,
      stats
    })

  } catch (error) {
    console.error('Get system overview error:', error)
    
    return NextResponse.json(
      { error: '获取系统概览失败' },
      { status: 500 }
    )
  }
}