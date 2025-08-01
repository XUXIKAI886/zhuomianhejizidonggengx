import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    const { userId, newPassword } = await request.json()

    // 验证必需参数
    if (!userId) {
      return NextResponse.json(
        { error: '用户ID不能为空' },
        { status: 400 }
      )
    }

    if (!newPassword) {
      return NextResponse.json(
        { error: '新密码不能为空' },
        { status: 400 }
      )
    }

    // 验证密码长度
    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: '密码至少需要6个字符' },
        { status: 400 }
      )
    }

    // 重置密码
    await DatabaseService.resetUserPassword(userId, newPassword)
    
    console.log(`✅ 用户密码重置成功: ${userId}`)
    
    return NextResponse.json({
      success: true,
      message: '密码重置成功'
    })

  } catch (error) {
    console.error('Reset password error:', error)
    
    const errorMessage = error instanceof Error ? error.message : '密码重置失败'
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}