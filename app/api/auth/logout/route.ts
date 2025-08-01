import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: '用户ID不能为空' },
        { status: 400 }
      )
    }

    await DatabaseService.logoutUser(userId)
    
    console.log(`✅ User ${userId} logged out successfully`)
    
    return NextResponse.json({
      success: true,
      message: '登出成功'
    })

  } catch (error) {
    console.error('Logout error:', error)
    
    return NextResponse.json(
      { error: '登出失败' },
      { status: 500 }
    )
  }
}