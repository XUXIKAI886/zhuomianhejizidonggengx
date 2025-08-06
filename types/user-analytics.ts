// 用户行为深度分析类型定义

// 用户详细活动记录
export interface UserDetailedActivity {
  id?: string
  userId: string
  activityType: string // "login", "logout", "tool_click", "tool_session_start", "tool_session_end"
  toolId?: number
  toolName?: string
  sessionId?: string
  timestamp: string
  duration?: number // 使用时长（秒）
  deviceInfo?: string
  ipAddress?: string
  userAgent?: string
  metadata?: string // JSON字符串，存储额外信息
}

// 每日用户活动汇总
export interface DailyUserActivity {
  id?: string
  userId: string
  date: string // YYYY-MM-DD格式
  totalClicks: number
  totalUsageTime: number
  uniqueToolsUsed: number
  loginCount: number
  firstActivity: string
  lastActivity: string
  toolUsageBreakdown: ToolDailyUsage[]
}

// 工具每日使用情况
export interface ToolDailyUsage {
  toolId: number
  toolName: string
  clickCount: number
  usageTime: number
  sessionCount: number
  avgSessionDuration: number
}

// 用户行为模式分析
export interface UserBehaviorPattern {
  userId: string
  username: string
  activityPattern: string // "morning_user", "afternoon_user", "evening_user", "night_owl", "all_day"
  preferredTools: string[]
  avgSessionDuration: number
  peakActivityHour: number
  weeklyActivePattern: number[] // 0-6 表示周日到周六的活跃度
  toolSwitchingFrequency: number // 工具切换频率
  loyaltyScore: number // 用户忠诚度评分 0-100
  riskLevel: string // "low", "medium", "high" - 流失风险等级
}

// 工具使用时间线条目
export interface ToolTimelineEntry {
  date: string
  hour: number
  toolId: number
  toolName: string
  clickCount: number
  usageTime: number
}

// 活跃度热力图条目
export interface HeatmapEntry {
  date: string
  hour: number
  activityLevel: number // 0-100 活跃度等级
  clickCount: number
  toolCount: number
}

// 用户详细分析响应
export interface UserDetailedAnalytics {
  user: {
    id: string
    username: string
    role: 'admin' | 'user'
    isActive: boolean
    createdAt: string
    lastLoginAt?: string | null
    totalUsageTime: number
    loginCount: number
  }
  dailyActivities: DailyUserActivity[]
  recentActivities: UserDetailedActivity[]
  behaviorPattern: UserBehaviorPattern
  toolUsageTimeline: ToolTimelineEntry[]
  activityHeatmap: HeatmapEntry[]
}

// 活动类型映射
export const ACTIVITY_TYPE_MAP = {
  login: '登录',
  logout: '登出',
  tool_click: '工具点击',
  tool_session_start: '开始使用工具',
  tool_session_end: '结束使用工具'
} as const

// 活动模式映射
export const ACTIVITY_PATTERN_MAP = {
  high_activity: '高活跃用户',
  medium_activity: '中等活跃用户',
  low_activity: '低活跃用户',
  morning_user: '晨间用户',
  afternoon_user: '午间用户',
  evening_user: '晚间用户',
  night_owl: '夜猫子用户',
  all_day: '全天活跃用户'
} as const

// 风险等级映射
export const RISK_LEVEL_MAP = {
  low: '低风险',
  medium: '中等风险',
  high: '高风险'
} as const

// 风险等级颜色映射
export const RISK_LEVEL_COLORS = {
  low: 'text-green-600 bg-green-50 border-green-200',
  medium: 'text-yellow-600 bg-yellow-50 border-yellow-200',
  high: 'text-red-600 bg-red-50 border-red-200'
} as const

// 活跃度等级颜色映射 (0-100)
export const getActivityLevelColor = (level: number): string => {
  if (level >= 80) return 'bg-red-500'
  if (level >= 60) return 'bg-orange-500'
  if (level >= 40) return 'bg-yellow-500'
  if (level >= 20) return 'bg-blue-500'
  return 'bg-gray-300'
}

// 获取活跃度等级描述
export const getActivityLevelDescription = (level: number): string => {
  if (level >= 80) return '极高活跃'
  if (level >= 60) return '高活跃'
  if (level >= 40) return '中等活跃'
  if (level >= 20) return '低活跃'
  return '无活动'
}

// 时间格式化工具
export const formatDuration = (seconds: number): string => {
  if (seconds < 60) return `${seconds}秒`
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  if (hours > 0) {
    return `${hours}小时${minutes % 60}分钟`
  }
  return `${minutes}分钟`
}

// 获取小时标签
export const getHourLabel = (hour: number): string => {
  if (hour === 0) return '午夜'
  if (hour < 6) return '凌晨'
  if (hour < 12) return '上午'
  if (hour === 12) return '中午'
  if (hour < 18) return '下午'
  if (hour < 22) return '晚上'
  return '深夜'
}

// 工具使用强度计算
export const calculateToolIntensity = (clickCount: number, usageTime: number): 'low' | 'medium' | 'high' => {
  const intensity = clickCount * 0.3 + (usageTime / 60) * 0.7 // 综合考虑点击次数和使用时长
  if (intensity > 50) return 'high'
  if (intensity > 15) return 'medium'
  return 'low'
}

// 用户活跃度趋势分析
export interface UserActivityTrend {
  trend: 'increasing' | 'decreasing' | 'stable'
  trendPercentage: number
  description: string
}

// 计算用户活跃度趋势
export const calculateActivityTrend = (dailyActivities: DailyUserActivity[]): UserActivityTrend => {
  if (dailyActivities.length < 2) {
    return {
      trend: 'stable',
      trendPercentage: 0,
      description: '数据不足，无法分析趋势'
    }
  }

  const recent = dailyActivities.slice(0, Math.min(7, Math.floor(dailyActivities.length / 2)))
  const previous = dailyActivities.slice(Math.floor(dailyActivities.length / 2))

  const recentAvg = recent.reduce((sum, day) => sum + day.totalClicks, 0) / recent.length
  const previousAvg = previous.reduce((sum, day) => sum + day.totalClicks, 0) / previous.length

  if (previousAvg === 0) {
    return {
      trend: 'stable',
      trendPercentage: 0,
      description: '无历史数据对比'
    }
  }

  const change = ((recentAvg - previousAvg) / previousAvg) * 100
  
  if (Math.abs(change) < 10) {
    return {
      trend: 'stable',
      trendPercentage: change,
      description: '活跃度保持稳定'
    }
  }

  return {
    trend: change > 0 ? 'increasing' : 'decreasing',
    trendPercentage: Math.abs(change),
    description: change > 0 
      ? `活跃度上升 ${Math.round(Math.abs(change))}%`
      : `活跃度下降 ${Math.round(Math.abs(change))}%`
  }
}