import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/database'
import { Logger } from '@/lib/logger'

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    const { username, password, role = 'user' } = await request.json()

    Logger.info('ADMIN', 'CREATE_USER_ATTEMPT', { 
      username, 
      role,
      timestamp: new Date().toISOString()
    }, request)

    // 验证必需参数
    if (!username || !password) {
      Logger.warning('ADMIN', 'CREATE_USER_FAILED', { 
        reason: '参数不完整',
        username,
        hasPassword: !!password
      }, request)
      
      return NextResponse.json(
        { error: '用户名和密码不能为空' },
        { status: 400 }
      )
    }

    // 验证用户名长度
    if (username.length < 3) {
      Logger.warning('ADMIN', 'CREATE_USER_FAILED', { 
        reason: '用户名长度不足',
        username,
        length: username.length
      }, request)
      
      return NextResponse.json(
        { error: '用户名至少需要3个字符' },
        { status: 400 }
      )
    }

    // 验证密码长度
    if (password.length < 6) {
      Logger.warning('ADMIN', 'CREATE_USER_FAILED', { 
        reason: '密码长度不足',
        username,
        passwordLength: password.length
      }, request)
      
      return NextResponse.json(
        { error: '密码至少需要6个字符' },
        { status: 400 }
      )
    }

    // 验证角色
    if (!['admin', 'user'].includes(role)) {
      Logger.warning('ADMIN', 'CREATE_USER_FAILED', { 
        reason: '无效角色',
        username,
        role
      }, request)
      
      return NextResponse.json(
        { error: '角色必须是admin或user' },
        { status: 400 }
      )
    }

    // 检查用户名是否已存在
    try {
      await DatabaseService.loginUser(username, 'dummy_password')
      
      Logger.warning('ADMIN', 'CREATE_USER_FAILED', { 
        reason: '用户名已存在',
        username
      }, request)
      
      return NextResponse.json(
        { error: '用户名已存在' },
        { status: 409 }
      )
    } catch (error) {
      // 用户不存在，可以继续创建
    }

    // 创建新用户
    const newUser = await DatabaseService.createUser(username, password, role)
    const duration = Date.now() - startTime
    
    Logger.success('ADMIN', 'CREATE_USER_SUCCESS', { 
      userId: newUser.id,
      username: newUser.username,
      role: newUser.role,
      isActive: newUser.isActive,
      duration: `${duration}ms`
    }, request, newUser.id)
    
    return NextResponse.json({
      success: true,
      user: newUser,
      message: '用户创建成功'
    })

  } catch (error) {
    const duration = Date.now() - startTime
    const errorMessage = error instanceof Error ? error.message : '用户创建失败'
    
    Logger.error('ADMIN', 'CREATE_USER_ERROR', { 
      error: errorMessage,
      duration: `${duration}ms`,
      stack: error instanceof Error ? error.stack : undefined
    }, request)
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}