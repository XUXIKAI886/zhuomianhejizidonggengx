import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    // 在实际应用中，这里应该验证管理员权限
    // 现在简化实现，直接返回用户列表
    
    const users = await DatabaseService.getAllUsers()
    
    return NextResponse.json({
      success: true,
      users
    })

  } catch (error) {
    console.error('Get users error:', error)
    
    return NextResponse.json(
      { error: '获取用户列表失败' },
      { status: 500 }
    )
  }
}