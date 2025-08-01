import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/database'
import { Logger } from '@/lib/logger'

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    const { userId } = await request.json()

    Logger.info('ADMIN', 'DELETE_USER_ATTEMPT', { 
      userId,
      timestamp: new Date().toISOString()
    }, request)

    if (!userId) {
      Logger.warning('ADMIN', 'DELETE_USER_FAILED', { 
        reason: '用户ID为空'
      }, request)
      
      return NextResponse.json(
        { error: '用户ID不能为空' },
        { status: 400 }
      )
    }

    // 先获取用户信息（用于日志记录）
    const users = await DatabaseService.getUsers()
    const { ObjectId } = require('mongodb')
    const targetUser = await users.findOne({ _id: new ObjectId(userId) })
    
    if (!targetUser) {
      Logger.warning('ADMIN', 'DELETE_USER_FAILED', { 
        reason: '用户不存在',
        userId
      }, request)
      
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      )
    }

    // 执行删除
    await DatabaseService.deleteUser(userId)
    const duration = Date.now() - startTime
    
    Logger.success('ADMIN', 'DELETE_USER_SUCCESS', { 
      deletedUserId: userId,
      deletedUsername: targetUser.username,
      deletedRole: targetUser.role,
      duration: `${duration}ms`
    }, request, userId)
    
    return NextResponse.json({
      success: true,
      message: '用户删除成功'
    })

  } catch (error) {
    const duration = Date.now() - startTime
    const errorMessage = error instanceof Error ? error.message : '用户删除失败'
    
    Logger.error('ADMIN', 'DELETE_USER_ERROR', { 
      error: errorMessage,
      duration: `${duration}ms`,
      stack: error instanceof Error ? error.stack : undefined
    }, request)
    
    return NextResponse.json(
      { error: '用户删除失败' },
      { status: 500 }
    )
  }
}