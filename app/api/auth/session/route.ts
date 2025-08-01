import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // 在Web环境中，我们无法维持服务器端的会话状态
    // 因为Next.js API路由是无状态的
    // 这里返回错误，让前端处理重新登录
    
    return NextResponse.json(
      { error: '会话已过期，请重新登录' },
      { status: 401 }
    )

  } catch (error) {
    console.error('Session check error:', error)
    
    return NextResponse.json(
      { error: '会话检查失败' },
      { status: 500 }
    )
  }
}