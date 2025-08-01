import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/database'
import { Logger } from '@/lib/logger'

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    const { username, password, rememberMe, autoLogin } = await request.json()

    Logger.info('AUTH', 'LOGIN_ATTEMPT', { 
      username, 
      rememberMe, 
      autoLogin,
      timestamp: new Date().toISOString()
    }, request)

    if (!username || !password) {
      Logger.warning('AUTH', 'LOGIN_FAILED', { 
        reason: '用户名或密码为空', 
        username 
      }, request)
      
      return NextResponse.json(
        { error: '用户名和密码不能为空' },
        { status: 400 }
      )
    }

    const user = await DatabaseService.loginUser(username, password)
    const duration = Date.now() - startTime
    
    Logger.success('AUTH', 'LOGIN_SUCCESS', { 
      userId: user.id,
      username: user.username,
      role: user.role,
      loginCount: user.loginCount,
      duration: `${duration}ms`
    }, request, user.id)
    
    return NextResponse.json({
      success: true,
      user,
      message: '登录成功'
    })

  } catch (error) {
    const duration = Date.now() - startTime
    const errorMessage = error instanceof Error ? error.message : '登录失败'
    
    Logger.error('AUTH', 'LOGIN_ERROR', { 
      error: errorMessage,
      duration: `${duration}ms`,
      stack: error instanceof Error ? error.stack : undefined
    }, request)
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 401 }
    )
  }
}