import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    // 获取系统概览数据 (包含totalSessions)
    const stats = await DatabaseService.getSystemOverview()
    
    // 构造与Tauri后端一致的SystemAnalytics格式
    const systemAnalytics = {
      totalUsers: stats.totalUsers,
      activeUsersToday: stats.activeUsersToday,
      totalSessions: stats.totalSessions, // 这是关键数据 - 真实的143
      averageSessionDuration: 1800, // 简化实现
      mostPopularTools: stats.mostPopularTools || [],
      userGrowthTrend: [
        {
          date: new Date().toISOString().split('T')[0],
          newUsers: 0,
          activeUsers: stats.activeUsersToday,
          totalSessions: stats.totalSessions
        }
      ],
      toolUsageTrend: [
        {
          date: new Date().toISOString().split('T')[0],
          totalClicks: 0,
          totalUsageTime: 0,
          uniqueUsers: stats.activeUsersToday
        }
      ]
    }
    
    return NextResponse.json(systemAnalytics)

  } catch (error) {
    console.error('Get system analytics error:', error)
    
    return NextResponse.json(
      { error: '获取系统分析数据失败' },
      { status: 500 }
    )
  }
}
