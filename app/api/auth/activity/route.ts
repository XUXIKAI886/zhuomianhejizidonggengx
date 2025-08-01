import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    const { userId, activityType, toolId, duration } = await request.json()

    if (!userId || !activityType) {
      return NextResponse.json(
        { error: '用户ID和活动类型不能为空' },
        { status: 400 }
      )
    }

    await DatabaseService.trackUserActivity(userId, activityType, toolId, duration)
    
    return NextResponse.json({
      success: true,
      message: '活动记录成功'
    })

  } catch (error) {
    console.error('Activity tracking error:', error)
    
    return NextResponse.json(
      { error: '活动记录失败' },
      { status: 500 }
    )
  }
}