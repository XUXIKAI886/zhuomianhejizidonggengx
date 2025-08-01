import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    const { userId, username, role, isActive } = await request.json()

    // 验证必需参数
    if (!userId) {
      return NextResponse.json(
        { error: '用户ID不能为空' },
        { status: 400 }
      )
    }

    // 准备更新数据
    const updates: any = {}
    
    if (username !== undefined) {
      if (username.length < 3) {
        return NextResponse.json(
          { error: '用户名至少需要3个字符' },
          { status: 400 }
        )
      }
      updates.username = username
    }

    if (role !== undefined) {
      if (!['admin', 'user'].includes(role)) {
        return NextResponse.json(
          { error: '角色必须是admin或user' },
          { status: 400 }
        )
      }
      updates.role = role
    }

    if (isActive !== undefined) {
      updates.isActive = isActive
    }

    // 检查是否有要更新的内容
    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: '没有要更新的内容' },
        { status: 400 }
      )
    }

    // 更新用户
    const updatedUser = await DatabaseService.updateUser(userId, updates)
    
    console.log(`✅ 用户更新成功: ${updatedUser.username}`)
    
    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: '用户更新成功'
    })

  } catch (error) {
    console.error('Update user error:', error)
    
    const errorMessage = error instanceof Error ? error.message : '用户更新失败'
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}