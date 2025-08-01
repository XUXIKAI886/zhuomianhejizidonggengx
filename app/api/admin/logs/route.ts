import { NextRequest, NextResponse } from 'next/server'
import { Logger } from '@/lib/logger'

export async function POST(request: NextRequest) {
  try {
    const { date, category, limit = 50 } = await request.json()

    Logger.info('ADMIN', 'VIEW_LOGS_ATTEMPT', { 
      date, 
      category, 
      limit,
      timestamp: new Date().toISOString()
    }, request)

    const logs = await Logger.readLogs(date, category, limit)
    const availableDates = Logger.getAvailableDates()
    
    Logger.success('ADMIN', 'VIEW_LOGS_SUCCESS', { 
      logsCount: logs.length,
      availableDates: availableDates.length
    }, request)
    
    return NextResponse.json({
      success: true,
      logs,
      availableDates,
      totalCount: logs.length
    })

  } catch (error) {
    Logger.error('ADMIN', 'VIEW_LOGS_ERROR', { 
      error: error instanceof Error ? error.message : '查看日志失败',
      stack: error instanceof Error ? error.stack : undefined
    }, request)
    
    return NextResponse.json(
      { error: '获取日志失败' },
      { status: 500 }
    )
  }
}