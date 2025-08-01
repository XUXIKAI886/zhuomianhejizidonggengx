import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    const { userId, isActive } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: '用户ID不能为空' },
        { status: 400 }
      )
    }

    await DatabaseService.toggleUserStatus(userId, isActive)
    
    return NextResponse.json({
      success: true,
      message: '用户状态更新成功'
    })

  } catch (error) {
    console.error('Toggle user status error:', error)
    
    return NextResponse.json(
      { error: '用户状态更新失败' },
      { status: 500 }
    )
  }
}