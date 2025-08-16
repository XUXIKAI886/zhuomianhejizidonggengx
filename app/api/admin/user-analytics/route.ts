import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    console.log('📊 [admin/user-analytics] 开始获取用户分析数据...')
    
    const { limit } = await request.json().catch(() => ({ limit: 20 }))
    
    const db = await getDatabase()
    console.log('✅ [admin/user-analytics] 数据库连接成功')
    
    // 实现与 Rust 后端相同的聚合管道查询
    const pipeline = [
      {
        $match: { isActive: true }
      },
      {
        $lookup: {
          from: "tool_usage",
          localField: "_id", 
          foreignField: "userId",
          as: "tool_usage"
        }
      },
      {
        $addFields: {
          totalToolClicks: { 
            $sum: {
              $map: {
                input: "$tool_usage",
                as: "usage",
                in: "$$usage.clickCount"
              }
            }
          },
          totalUsageTime: { 
            $sum: {
              $map: {
                input: "$tool_usage", 
                as: "usage",
                in: "$$usage.totalUsageTime"
              }
            }
          },
          loginCount: { $ifNull: ["$loginCount", 0] },
          toolUsageDetails: {
            $sortArray: {
              input: "$tool_usage",
              sortBy: { clickCount: -1 }
            }
          },
          favoriteTools: {
            $map: {
              input: { $slice: [
                { $sortArray: {
                  input: "$tool_usage",
                  sortBy: { clickCount: -1 }
                }}, 5
              ]},
              as: "tool",
              in: "$$tool.toolName"
            }
          }
        }
      },
      {
        $sort: { totalToolClicks: -1 }
      },
      {
        $limit: limit || 50
      }
    ]
    
    console.log('📊 [admin/user-analytics] 执行MongoDB聚合管道查询...')
    const users = db.collection('users')
    const cursor = users.aggregate(pipeline)
    const results = await cursor.toArray()
    
    console.log(`✅ [admin/user-analytics] 聚合查询完成，获取到 ${results.length} 个用户`)
    
    // 转换结果为前端需要的格式
    const userAnalytics = results.map(doc => {
      console.log(`📄 [admin/user-analytics] 处理用户: ${doc.username}`)
      console.log(`🔍 [admin/user-analytics] 工具使用详情数量: ${(doc.toolUsageDetails || []).length}`)
      
      return {
        id: doc._id.toString(),
        username: doc.username,
        role: doc.role || 'user',
        totalUsageTime: doc.totalUsageTime || 0,
        loginCount: doc.loginCount || 0,
        lastLoginAt: doc.lastLoginAt || null,
        createdAt: doc.createdAt || new Date().toISOString(),
        isActive: doc.isActive !== false,
        totalToolClicks: doc.totalToolClicks || 0,
        toolUsageDetails: (doc.toolUsageDetails || []).map((tool: any) => ({
          toolId: tool.toolId,
          toolName: tool.toolName || `工具${tool.toolId}`,
          clickCount: tool.clickCount || 0,
          totalUsageTime: tool.totalUsageTime || 0,
          lastUsedAt: tool.lastUsedAt
        })),
        favoriteTools: doc.favoriteTools || []
      }
    })
    
    console.log(`✅ [admin/user-analytics] 用户分析数据转换完成，返回 ${userAnalytics.length} 个用户`)
    
    return NextResponse.json(userAnalytics)

  } catch (error) {
    console.error('❌ [admin/user-analytics] 获取用户分析数据失败:', error)
    console.error('❌ [admin/user-analytics] Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    
    return NextResponse.json(
      { error: `获取用户分析数据失败: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
  }
}