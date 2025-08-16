import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 [debug/check-data] 开始检查数据库数据...')
    
    const db = await getDatabase()
    
    // 检查users集合
    const usersCollection = db.collection('users')
    const totalUsers = await usersCollection.countDocuments()
    const activeUsers = await usersCollection.countDocuments({ isActive: true })
    const allUsers = await usersCollection.find({}).toArray()
    
    console.log(`📊 Users集合: 总用户=${totalUsers}, 活跃用户=${activeUsers}`)
    
    // 检查tool_usage集合
    const toolUsageCollection = db.collection('tool_usage')
    const totalToolUsage = await toolUsageCollection.countDocuments()
    const toolUsageRecords = await toolUsageCollection.find({}).limit(10).toArray()
    
    console.log(`📊 Tool_usage集合: 总记录=${totalToolUsage}`)
    
    // 检查user_sessions集合
    const sessionsCollection = db.collection('user_sessions')
    const totalSessions = await sessionsCollection.countDocuments()
    const sessionRecords = await sessionsCollection.find({}).limit(5).toArray()
    
    console.log(`📊 User_sessions集合: 总会话=${totalSessions}`)
    
    const result = {
      users: {
        total: totalUsers,
        active: activeUsers,
        list: allUsers.map(user => ({
          id: user._id.toString(),
          username: user.username,
          role: user.role,
          isActive: user.isActive,
          loginCount: user.loginCount || 0,
          createdAt: user.createdAt,
          lastLoginAt: user.lastLoginAt
        }))
      },
      toolUsage: {
        total: totalToolUsage,
        records: toolUsageRecords.map(record => ({
          userId: record.userId.toString(),
          toolId: record.toolId,
          toolName: record.toolName,
          clickCount: record.clickCount,
          totalUsageTime: record.totalUsageTime,
          lastUsedAt: record.lastUsedAt
        }))
      },
      sessions: {
        total: totalSessions,
        records: sessionRecords.map(session => ({
          userId: session.userId ? session.userId.toString() : null,
          loginAt: session.loginAt,
          logoutAt: session.logoutAt
        }))
      }
    }
    
    return NextResponse.json(result)

  } catch (error) {
    console.error('❌ [debug/check-data] 检查数据失败:', error)
    
    return NextResponse.json(
      { error: `检查数据失败: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  return GET(request)
}