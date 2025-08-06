'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, AreaChart, Area
} from 'recharts'
import {
  User, Activity, Clock, TrendingUp, TrendingDown, Calendar,
  Target, Zap, AlertTriangle, Star, BarChart3, TimerIcon,
  MousePointer, X, RefreshCw,
  Brain, Lightbulb, Flame, Award, ChevronRight
} from 'lucide-react'
import { getUserDetailedAnalytics } from '@/lib/tauri-api'
import {
  UserDetailedAnalytics,
  DailyUserActivity, 
  UserBehaviorPattern,
  ToolTimelineEntry,
  HeatmapEntry,
  UserDetailedActivity,
  ACTIVITY_TYPE_MAP,
  ACTIVITY_PATTERN_MAP,
  RISK_LEVEL_MAP,
  RISK_LEVEL_COLORS,
  formatDuration,
  getHourLabel,
  getActivityLevelColor,
  getActivityLevelDescription,
  calculateToolIntensity,
  calculateActivityTrend
} from '@/types/user-analytics'

interface UserDetailedAnalyticsProps {
  isOpen: boolean
  onClose: () => void
  userId: string | null
  username: string | null
}

export function UserDetailedAnalyticsModal({ 
  isOpen, 
  onClose, 
  userId, 
  username 
}: UserDetailedAnalyticsProps) {
  const [analytics, setAnalytics] = useState<UserDetailedAnalytics | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [days, setDays] = useState(30)

  const loadUserAnalytics = async () => {
    if (!userId) return

    try {
      setLoading(true)
      setError(null)
      console.log('🔍 加载用户详细分析:', { userId, days })
      
      const result = await getUserDetailedAnalytics(userId, days)
      console.log('✅ 用户详细分析加载成功:', result)
      
      setAnalytics(result)
    } catch (error: any) {
      console.error('❌ 用户详细分析加载失败:', error)
      setError(error.message || '加载用户分析数据失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen && userId) {
      loadUserAnalytics()
    }
  }, [isOpen, userId, days])

  const handleRefresh = () => {
    loadUserAnalytics()
  }

  const handleDaysChange = (newDays: number) => {
    setDays(newDays)
  }

  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content className="fixed left-[50%] top-[50%] z-50 grid translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg max-w-7xl w-[95vw] h-[95vh] p-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Brain className="w-6 h-6 text-blue-600" />
              <div>
                <DialogTitle className="text-xl font-bold text-gray-900">
                  用户深度行为分析
                </DialogTitle>
                <p className="text-sm text-gray-600 mt-1">
                  {username || '未知用户'} 的详细使用行为和模式分析
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* 时间范围选择 */}
              <div className="flex items-center space-x-1">
                {[7, 15, 30, 60, 90].map((d) => (
                  <Button
                    key={d}
                    variant={days === d ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleDaysChange(d)}
                    className="h-8 px-3 text-xs"
                  >
                    {d}天
                  </Button>
                ))}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={loading}
                className="h-8 px-3"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {loading && !analytics ? (
            <div className="p-6">
              <UserAnalyticsLoadingSkeleton />
            </div>
          ) : error ? (
            <div className="p-6">
              <Alert variant="destructive">
                <AlertTriangle className="w-4 h-4" />
                <AlertDescription>
                  {error}
                </AlertDescription>
              </Alert>
            </div>
          ) : analytics ? (
            <UserAnalyticsContent analytics={analytics} />
          ) : null}
        </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </Dialog>
  )
}

// 用户分析内容组件
function UserAnalyticsContent({ analytics }: { analytics: UserDetailedAnalytics }) {
  const activityTrend = calculateActivityTrend(analytics.dailyActivities)
  
  return (
    <ScrollArea className="h-full">
      <div className="p-6 space-y-6">
        {/* 用户概览卡片 */}
        <UserOverviewCard user={analytics.user} pattern={analytics.behaviorPattern} trend={activityTrend} />
        
        {/* 详细分析标签页 */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" className="flex items-center">
              <BarChart3 className="w-4 h-4 mr-2" />
              概览分析
            </TabsTrigger>
            <TabsTrigger value="daily" className="flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              每日活动
            </TabsTrigger>
            <TabsTrigger value="timeline" className="flex items-center">
              <TimerIcon className="w-4 h-4 mr-2" />
              使用时间线
            </TabsTrigger>
            <TabsTrigger value="heatmap" className="flex items-center">
              <Flame className="w-4 h-4 mr-2" />
              活跃度热力图
            </TabsTrigger>
            <TabsTrigger value="activities" className="flex items-center">
              <Activity className="w-4 h-4 mr-2" />
              活动记录
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <BehaviorPatternAnalysis pattern={analytics.behaviorPattern} />
            <UserActivityOverview dailyActivities={analytics.dailyActivities} />
          </TabsContent>

          <TabsContent value="daily" className="space-y-4">
            <DailyActivityChart dailyActivities={analytics.dailyActivities} />
            <DailyToolUsageBreakdown dailyActivities={analytics.dailyActivities} />
          </TabsContent>

          <TabsContent value="timeline" className="space-y-4">
            <ToolUsageTimeline timeline={analytics.toolUsageTimeline} />
          </TabsContent>

          <TabsContent value="heatmap" className="space-y-4">
            <ActivityHeatmap heatmap={analytics.activityHeatmap} />
          </TabsContent>

          <TabsContent value="activities" className="space-y-4">
            <RecentActivitiesList activities={analytics.recentActivities} />
          </TabsContent>
        </Tabs>
      </div>
    </ScrollArea>
  )
}

// 用户概览卡片
function UserOverviewCard({ 
  user, 
  pattern, 
  trend 
}: { 
  user: UserDetailedAnalytics['user']
  pattern: UserBehaviorPattern
  trend: any
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* 基本信息 */}
      <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-blue-800 flex items-center">
            <User className="w-4 h-4 mr-2" />
            用户基本信息
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-lg font-bold text-blue-900">{user.username}</p>
            <p className="text-xs text-blue-600">用户ID: {user.id.slice(-8)}</p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant={user.role === 'admin' ? 'destructive' : 'secondary'}>
              {user.role === 'admin' ? '管理员' : '普通用户'}
            </Badge>
            <Badge variant={user.isActive ? 'default' : 'outline'}>
              {user.isActive ? '活跃' : '禁用'}
            </Badge>
          </div>
          <div className="text-xs text-blue-600 space-y-1">
            <p>创建时间: {new Date(user.createdAt).toLocaleDateString()}</p>
            <p>最后登录: {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : '从未登录'}</p>
            <p>登录次数: {user.loginCount} 次</p>
          </div>
        </CardContent>
      </Card>

      {/* 行为模式 */}
      <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-purple-800 flex items-center">
            <Brain className="w-4 h-4 mr-2" />
            行为模式分析
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-sm font-medium text-purple-900">
              {ACTIVITY_PATTERN_MAP[pattern.activityPattern as keyof typeof ACTIVITY_PATTERN_MAP] || pattern.activityPattern}
            </p>
            <p className="text-xs text-purple-600">峰值活跃时段: {getHourLabel(pattern.peakActivityHour)}</p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-purple-600">忠诚度评分</span>
              <span className="text-xs font-medium text-purple-900">{Math.round(pattern.loyaltyScore)}/100</span>
            </div>
            <Progress value={pattern.loyaltyScore} className="h-2" />
          </div>

          <div className="flex items-center space-x-2">
            <Badge className={`text-xs ${RISK_LEVEL_COLORS[pattern.riskLevel as keyof typeof RISK_LEVEL_COLORS]}`}>
              {RISK_LEVEL_MAP[pattern.riskLevel as keyof typeof RISK_LEVEL_MAP]}
            </Badge>
            {pattern.riskLevel === 'high' && <AlertTriangle className="w-3 h-3 text-red-500" />}
          </div>
        </CardContent>
      </Card>

      {/* 活跃度趋势 */}
      <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-green-800 flex items-center">
            {trend.trend === 'increasing' ? <TrendingUp className="w-4 h-4 mr-2" /> : 
             trend.trend === 'decreasing' ? <TrendingDown className="w-4 h-4 mr-2" /> :
             <Activity className="w-4 h-4 mr-2" />}
            活跃度趋势
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-lg font-bold text-green-900">
              {trend.trend === 'increasing' ? '↗️ 上升趋势' :
               trend.trend === 'decreasing' ? '↘️ 下降趋势' : '➡️ 保持稳定'}
            </p>
            <p className="text-xs text-green-600">{trend.description}</p>
          </div>
          
          <div className="space-y-2">
            <div className="text-xs text-green-600 space-y-1">
              <p>平均会话时长: {formatDuration(pattern.avgSessionDuration)}</p>
              <p>工具切换频率: {pattern.toolSwitchingFrequency.toFixed(1)} 次/会话</p>
            </div>
          </div>

          <div className="pt-2">
            <p className="text-xs text-green-600 mb-2">偏好工具:</p>
            <div className="flex flex-wrap gap-1">
              {pattern.preferredTools.slice(0, 3).map((tool, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tool}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// 行为模式分析组件
function BehaviorPatternAnalysis({ pattern }: { pattern: UserBehaviorPattern }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Lightbulb className="w-5 h-5 mr-2" />
          深度行为模式分析
        </CardTitle>
        <CardDescription>基于AI算法的用户行为模式识别和预测</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 每周活跃模式 */}
          <div>
            <h4 className="font-medium mb-3 flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              每周活跃模式
            </h4>
            <div className="space-y-2">
              {['周日', '周一', '周二', '周三', '周四', '周五', '周六'].map((day, index) => (
                <div key={day} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 w-12">{day}</span>
                  <div className="flex-1 mx-3">
                    <Progress value={pattern.weeklyActivePattern[index] * 20} className="h-2" />
                  </div>
                  <span className="text-xs text-gray-500 w-8">
                    {pattern.weeklyActivePattern[index]}/5
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 用户画像标签 */}
          <div>
            <h4 className="font-medium mb-3 flex items-center">
              <Award className="w-4 h-4 mr-2" />
              用户画像标签
            </h4>
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <Badge variant="default" className="bg-blue-500">
                  {ACTIVITY_PATTERN_MAP[pattern.activityPattern as keyof typeof ACTIVITY_PATTERN_MAP]}
                </Badge>
                <Badge variant="secondary">
                  峰值时段: {getHourLabel(pattern.peakActivityHour)}
                </Badge>
                <Badge variant={pattern.loyaltyScore > 70 ? 'default' : 'outline'}>
                  {pattern.loyaltyScore > 70 ? '高忠诚度' : pattern.loyaltyScore > 40 ? '中等忠诚度' : '低忠诚度'}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">工具专业度</span>
                  <span className="font-medium">
                    {pattern.preferredTools.length > 5 ? '多面手' : 
                     pattern.preferredTools.length > 2 ? '专业型' : '入门级'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">使用稳定性</span>
                  <span className="font-medium">
                    {pattern.toolSwitchingFrequency < 2 ? '稳定型' : 
                     pattern.toolSwitchingFrequency < 4 ? '探索型' : '跳跃型'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// 用户活动概览
function UserActivityOverview({ dailyActivities }: { dailyActivities: DailyUserActivity[] }) {
  const totalClicks = dailyActivities.reduce((sum, day) => sum + day.totalClicks, 0)
  const totalUsageTime = dailyActivities.reduce((sum, day) => sum + day.totalUsageTime, 0)
  const totalUniqueTools = Math.max(...dailyActivities.map(day => day.uniqueToolsUsed), 0)
  const avgDailyClicks = dailyActivities.length > 0 ? totalClicks / dailyActivities.length : 0

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-blue-600 font-medium">总点击次数</p>
              <p className="text-xl font-bold text-blue-900">{totalClicks.toLocaleString()}</p>
            </div>
            <MousePointer className="w-8 h-8 text-blue-500" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-green-600 font-medium">总使用时长</p>
              <p className="text-xl font-bold text-green-900">{formatDuration(totalUsageTime)}</p>
            </div>
            <Clock className="w-8 h-8 text-green-500" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-purple-200 bg-purple-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-purple-600 font-medium">使用工具数</p>
              <p className="text-xl font-bold text-purple-900">{totalUniqueTools}</p>
            </div>
            <Target className="w-8 h-8 text-purple-500" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-orange-600 font-medium">日均点击</p>
              <p className="text-xl font-bold text-orange-900">{Math.round(avgDailyClicks)}</p>
            </div>
            <BarChart3 className="w-8 h-8 text-orange-500" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// 每日活动图表
function DailyActivityChart({ dailyActivities }: { dailyActivities: DailyUserActivity[] }) {
  const chartData = dailyActivities.map(day => ({
    date: new Date(day.date).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }),
    totalClicks: day.totalClicks,
    totalUsageTime: Math.round(day.totalUsageTime / 60), // 转换为分钟
    uniqueTools: day.uniqueToolsUsed,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <BarChart3 className="w-5 h-5 mr-2" />
          每日活动趋势
        </CardTitle>
        <CardDescription>过去{dailyActivities.length}天的详细活动统计</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip 
              formatter={(value, name) => [
                name === 'totalUsageTime' ? `${value}分钟` : value,
                name === 'totalUsageTime' ? '使用时长' : 
                name === 'totalClicks' ? '点击次数' : '使用工具数'
              ]}
            />
            <Area
              type="monotone"
              dataKey="totalClicks"
              stackId="1"
              stroke="#8884d8"
              fill="#8884d8"
              fillOpacity={0.6}
            />
            <Area
              type="monotone"
              dataKey="totalUsageTime"
              stackId="2"
              stroke="#82ca9d"
              fill="#82ca9d"
              fillOpacity={0.6}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

// 每日工具使用详情
function DailyToolUsageBreakdown({ dailyActivities }: { dailyActivities: DailyUserActivity[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Target className="w-5 h-5 mr-2" />
          每日工具使用详情
        </CardTitle>
        <CardDescription>每天使用的具体工具和时长分布</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          <div className="space-y-4">
            {dailyActivities.slice(0, 10).map((day, index) => (
              <div key={day.date} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">{new Date(day.date).toLocaleDateString('zh-CN')}</h4>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>{day.totalClicks}次点击</span>
                    <span>{formatDuration(day.totalUsageTime)}</span>
                    <span>{day.uniqueToolsUsed}个工具</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {day.toolUsageBreakdown.map((tool, toolIndex) => (
                    <div key={toolIndex} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                      <span className="font-medium truncate">{tool.toolName}</span>
                      <div className="flex items-center space-x-2 text-xs text-gray-600">
                        <span>{tool.clickCount}次</span>
                        <span>{formatDuration(tool.usageTime)}</span>
                        <Badge 
                          variant={calculateToolIntensity(tool.clickCount, tool.usageTime) === 'high' ? 'default' : 'outline'}
                          className="text-xs"
                        >
                          {calculateToolIntensity(tool.clickCount, tool.usageTime) === 'high' ? '高频' :
                           calculateToolIntensity(tool.clickCount, tool.usageTime) === 'medium' ? '中频' : '低频'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

// 工具使用时间线
function ToolUsageTimeline({ timeline }: { timeline: ToolTimelineEntry[] }) {
  // 按日期分组
  const groupedTimeline = timeline.reduce((acc, entry) => {
    if (!acc[entry.date]) {
      acc[entry.date] = []
    }
    acc[entry.date].push(entry)
    return acc
  }, {} as Record<string, ToolTimelineEntry[]>)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <TimerIcon className="w-5 h-5 mr-2" />
          工具使用时间线
        </CardTitle>
        <CardDescription>按时间顺序展示的详细工具使用记录</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          <div className="space-y-6">
            {Object.entries(groupedTimeline)
              .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
              .slice(0, 7) // 只显示最近7天
              .map(([date, entries]) => (
                <div key={date} className="space-y-3">
                  <h4 className="font-medium text-lg border-b pb-2">
                    {new Date(date).toLocaleDateString('zh-CN', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </h4>
                  
                  <div className="space-y-2">
                    {entries
                      .sort((a, b) => b.hour - a.hour)
                      .map((entry, index) => (
                        <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                              <Clock className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium">{entry.toolName}</p>
                              <p className="text-xs text-gray-500">
                                {getHourLabel(entry.hour)} {entry.hour}:00
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex-1"></div>
                          
                          <div className="text-right">
                            <p className="font-medium text-blue-600">{entry.clickCount} 次点击</p>
                            <p className="text-xs text-gray-500">{formatDuration(entry.usageTime)}</p>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

// 活跃度热力图
function ActivityHeatmap({ heatmap }: { heatmap: HeatmapEntry[] }) {
  // 创建24小时x7天的网格
  const hours = Array.from({ length: 24 }, (_, i) => i)
  const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  
  // 按日期和小时组织数据
  const heatmapData = new Map<string, number>()
  heatmap.forEach(entry => {
    const key = `${entry.date}-${entry.hour}`
    heatmapData.set(key, entry.activityLevel)
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Flame className="w-5 h-5 mr-2" />
          24小时活跃度热力图
        </CardTitle>
        <CardDescription>显示用户在不同时间段的活跃程度</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* 时间轴 */}
          <div className="grid grid-cols-25 gap-1 text-xs text-gray-500">
            <div></div> {/* 空白占位 */}
            {hours.map(hour => (
              <div key={hour} className="text-center">
                {hour % 6 === 0 ? hour : ''}
              </div>
            ))}
          </div>
          
          {/* 热力图网格 */}
          <div className="space-y-1">
            {days.map((day, dayIndex) => (
              <div key={day} className="grid grid-cols-25 gap-1 items-center">
                <div className="text-xs text-gray-600 w-8">{day}</div>
                {hours.map(hour => {
                  // 这里简化处理，实际应该根据真实日期计算
                  const level = Math.floor(Math.random() * 100) // 临时数据
                  return (
                    <div
                      key={hour}
                      className={`w-4 h-4 rounded-sm ${getActivityLevelColor(level)} cursor-pointer`}
                      title={`${day} ${hour}:00 - 活跃度: ${level}%`}
                    />
                  )
                })}
              </div>
            ))}
          </div>
          
          {/* 图例 */}
          <div className="flex items-center justify-center space-x-4 text-xs text-gray-600">
            <span>低活跃</span>
            <div className="flex space-x-1">
              {[0, 20, 40, 60, 80].map(level => (
                <div
                  key={level}
                  className={`w-3 h-3 rounded-sm ${getActivityLevelColor(level)}`}
                />
              ))}
            </div>
            <span>高活跃</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// 最近活动记录列表
function RecentActivitiesList({ activities }: { activities: UserDetailedActivity[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Activity className="w-5 h-5 mr-2" />
          最近活动记录
        </CardTitle>
        <CardDescription>最近50条用户活动的详细记录</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-80">
          <div className="space-y-2">
            {activities.map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    activity.activityType === 'login' ? 'bg-green-100' :
                    activity.activityType === 'logout' ? 'bg-red-100' :
                    'bg-blue-100'
                  }`}>
                    {activity.activityType === 'login' ? '🔓' :
                     activity.activityType === 'logout' ? '🔒' :
                     '🔧'}
                  </div>
                  <div>
                    <p className="font-medium text-sm">
                      {ACTIVITY_TYPE_MAP[activity.activityType as keyof typeof ACTIVITY_TYPE_MAP] || activity.activityType}
                    </p>
                    <p className="text-xs text-gray-500">
                      {activity.toolName || '系统活动'}
                      {activity.duration ? ` - ${formatDuration(activity.duration)}` : ''}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">
                    {new Date(activity.timestamp).toLocaleString()}
                  </p>
                  {activity.metadata && (
                    <p className="text-xs text-gray-400">
                      {JSON.parse(activity.metadata).clickCount && `${JSON.parse(activity.metadata).clickCount}次点击`}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

// 加载骨架屏
function UserAnalyticsLoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* 概览卡片骨架 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map(i => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-8 w-24 mb-2" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* 图表骨架 */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-60" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    </div>
  )
}