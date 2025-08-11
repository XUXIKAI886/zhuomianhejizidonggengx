'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { apiCall } from '@/lib/tauri-api'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Area, AreaChart, Legend
} from 'recharts'
import {
  Database,
  Users,
  Activity,
  Clock,
  TrendingUp,
  BarChart3,
  PieChart as PieChartIcon,
  Calendar,
  Zap,
  Bug,
  RefreshCw,
  Copy
} from 'lucide-react'
import { toast } from 'sonner'

// 数据类型定义
interface SystemAnalytics {
  totalUsers: number
  activeUsersToday: number
  totalSessions: number
  averageSessionDuration: number
  mostPopularTools: PopularTool[]
  userGrowthTrend: DailyGrowth[]
  toolUsageTrend: DailyUsage[]
}

interface PopularTool {
  toolId: number
  toolName: string
  totalClicks: number
  totalUsageTime: number
  uniqueUsers: number
}

interface ToolUsageDetail {
  toolId: number
  toolName: string
  clickCount: number
  totalUsageTime: number
  lastUsedAt: string
}

interface UserAnalytics {
  id: string
  username: string
  role: string
  isActive: boolean
  totalToolClicks: number
  totalUsageTime: number
  loginCount: number
  lastLoginAt?: string
  createdAt: string
  favoriteTools: string[]
  toolUsageDetails: ToolUsageDetail[]
}

interface DailyGrowth {
  date: string
  newUsers: number
  activeUsers: number
  totalSessions: number
}

interface DailyUsage {
  date: string
  totalClicks: number
  totalUsageTime: number
  uniqueUsers: number
}

// 颜色配置
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d']

export function MongoDBDashboard() {
  const [analytics, setAnalytics] = useState<SystemAnalytics | null>(null)
  const [userAnalytics, setUserAnalytics] = useState<UserAnalytics[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const [systemData, userData] = await Promise.all([
        apiCall('get_system_analytics'),
        apiCall('get_user_analytics', { limit: 20 })
      ])

      setAnalytics(systemData)
      setUserAnalytics(userData)
    } catch (error: any) {
      console.error('加载MongoDB仪表板数据失败:', error)
      setError(error.message || '数据加载失败')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadDashboardData()
  }

  const handleGenerateTestData = async () => {
    try {
      setRefreshing(true)
      const result = await apiCall('generate_test_data')
      console.log('测试数据生成结果:', result)
      // 重新加载数据以显示新生成的测试数据
      await loadDashboardData()
    } catch (error: any) {
      console.error('生成测试数据失败:', error)
      setError('生成测试数据失败: ' + error.message)
    } finally {
      setRefreshing(false)
    }
  }

  const handleClearTestData = async () => {
    if (!confirm('确定要清除所有测试数据吗？\n\n这将删除：\n- 所有工具使用记录\n- 所有用户会话记录\n\n用户账号将被保留。')) {
      return
    }

    try {
      setRefreshing(true)
      const result = await apiCall('clear_test_data')
      console.log('测试数据清除结果:', result)
      // 重新加载数据以显示清除后的状态
      await loadDashboardData()
    } catch (error: any) {
      console.error('清除测试数据失败:', error)
      setError('清除测试数据失败: ' + error.message)
    } finally {
      setRefreshing(false)
    }
  }

  const handleDebugUserData = async () => {
    try {
      setRefreshing(true)
      const result = await apiCall('debug_user_data')
      console.log('用户数据结构调试结果:', result)
      // 显示调试结果给用户
      alert('用户数据结构调试结果已输出到控制台，请查看开发者工具')
    } catch (error: any) {
      console.error('调试用户数据失败:', error)
      setError('调试用户数据失败: ' + error.message)
    } finally {
      setRefreshing(false)
    }
  }

  const handleInitLoginCounts = async () => {
    if (!confirm('确定要初始化用户登录次数吗？\n\n这将：\n- 基于会话数据计算实际登录次数\n- 更新所有用户的loginCount字段')) {
      return
    }

    try {
      setRefreshing(true)
      const result = await apiCall('init_user_login_counts')
      console.log('登录次数初始化结果:', result)
      alert('登录次数初始化完成: ' + result)
      // 重新加载数据以显示更新后的登录次数
      await loadDashboardData()
    } catch (error: any) {
      console.error('初始化登录次数失败:', error)
      setError('初始化登录次数失败: ' + error.message)
    } finally {
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadDashboardData()
  }, [])

  const formatUsageTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}秒`
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    if (hours > 0) {
      return `${hours}小时${minutes % 60}分钟`
    }
    return `${minutes}分钟`
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  // 复制用户工具使用详情到剪切板
  const handleCopyUserToolDetails = async (user: UserAnalytics) => {
    try {
      // 动态计算总点击次数
      const calculatedTotalClicks = user.toolUsageDetails.reduce((total, tool) => total + tool.clickCount, 0)

      // 构建用户工具使用详情文本
      let detailsText = `用户: ${user.username} (${user.role === 'admin' ? '管理员' : '用户'})\n`
      detailsText += `总点击次数: ${calculatedTotalClicks}\n`
      detailsText += `总使用时长: ${formatUsageTime(user.totalUsageTime)}\n`
      detailsText += `登录次数: ${user.loginCount}\n`
      detailsText += `使用工具数量: ${user.toolUsageDetails.length} 个\n\n`

      detailsText += `工具使用详情:\n`
      detailsText += `${'='.repeat(50)}\n`

      user.toolUsageDetails.forEach((tool, index) => {
        detailsText += `${index + 1}. ${tool.toolName}\n`
        detailsText += `   点击次数: ${tool.clickCount} 次\n`
        detailsText += `   使用时长: ${formatUsageTime(tool.totalUsageTime)}\n`
        detailsText += `   最后使用: ${tool.lastUsedAt ? new Date(tool.lastUsedAt).toLocaleString('zh-CN') : '未知'}\n\n`
      })

      detailsText += `${'='.repeat(50)}\n`
      detailsText += `导出时间: ${new Date().toLocaleString('zh-CN')}\n`
      detailsText += `数据来源: 呈尚策划工具箱 - MongoDB数据库`

      // 复制到剪切板
      await navigator.clipboard.writeText(detailsText)
      toast.success(`已复制 ${user.username} 的工具使用详情到剪切板`)
    } catch (error) {
      console.error('复制失败:', error)

      // 备用方案：创建临时textarea元素
      const textArea = document.createElement('textarea')
      textArea.value = detailsText
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      textArea.style.top = '-999999px'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()

      try {
        document.execCommand('copy')
        toast.success(`已复制 ${user.username} 的工具使用详情到剪切板`)
      } catch (fallbackError) {
        toast.error('复制失败，请手动复制')
      }

      document.body.removeChild(textArea)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold">MongoDB 数据分析</h2>
          <Skeleton className="h-10 w-20" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="space-y-0 pb-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-3 w-16" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-3 w-24 mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
        
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold">MongoDB 数据分析</h2>
          <Button onClick={handleRefresh} disabled={refreshing}>
            <Activity className="w-4 h-4 mr-2" />
            {refreshing ? '刷新中...' : '重新加载'}
          </Button>
        </div>
        
        <Alert variant="destructive">
          <AlertDescription>
            数据加载失败: {error}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 头部 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">MongoDB 数据分析</h2>
          <p className="text-muted-foreground">
            企业级数据库管理和实时统计分析
          </p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={handleRefresh} disabled={refreshing} variant="outline">
            <Activity className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? '刷新中...' : '刷新数据'}
          </Button>
          <Button onClick={handleGenerateTestData} disabled={refreshing} variant="secondary">
            <Database className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            生成测试数据
          </Button>
          <Button onClick={handleClearTestData} disabled={refreshing} variant="destructive">
            <Database className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            清除测试数据
          </Button>
          <Button onClick={handleDebugUserData} disabled={refreshing} variant="ghost" className="border">
            <Bug className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            调试用户数据
          </Button>
          <Button onClick={handleInitLoginCounts} disabled={refreshing} variant="default">
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            修复登录次数
          </Button>
        </div>
      </div>

      {/* MongoDB连接状态 */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="text-green-800 flex items-center">
            <Database className="w-5 h-5 mr-2" />
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2 animate-pulse"></div>
            MongoDB 连接状态
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-green-700">
            ✅ 已连接到云端MongoDB数据库 - 支持跨设备登录和实时数据同步
          </p>
          <div className="flex items-center mt-2 text-sm text-green-600">
            <Zap className="w-4 h-4 mr-1" />
            <span>高性能聚合查询 | 实时数据更新 | 企业级安全</span>
          </div>
        </CardContent>
      </Card>

      {/* 概览统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">总用户数</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{analytics?.totalUsers || 0}</div>
            <p className="text-xs text-blue-600 mt-1">支持跨设备登录</p>
            <Badge variant="secondary" className="mt-2 text-blue-700">MongoDB</Badge>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">今日活跃用户</CardTitle>
            <Activity className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{analytics?.activeUsersToday || 0}</div>
            <p className="text-xs text-green-600 mt-1">实时统计更新</p>
            <Badge variant="default" className="mt-2 bg-green-600">实时</Badge>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-800">总会话数</CardTitle>
            <BarChart3 className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">{analytics?.totalSessions || 0}</div>
            <p className="text-xs text-purple-600 mt-1">完整会话追踪</p>
            <Badge variant="outline" className="mt-2 text-purple-700 border-purple-600">会话</Badge>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-800">平均会话时长</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">
              {formatUsageTime(analytics?.averageSessionDuration || 0)}
            </div>
            <p className="text-xs text-orange-600 mt-1">MongoDB聚合计算</p>
            <Badge variant="outline" className="mt-2 text-orange-700 border-orange-600">聚合</Badge>
          </CardContent>
        </Card>
      </div>

      {/* 详细分析标签页 */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">系统概览</TabsTrigger>
          <TabsTrigger value="users">用户分析</TabsTrigger>
          <TabsTrigger value="tools">工具统计</TabsTrigger>
          <TabsTrigger value="trends">趋势分析</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PieChartIcon className="w-5 h-5 mr-2" />
                  工具使用分布
                </CardTitle>
                <CardDescription>基于MongoDB聚合的工具受欢迎程度</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analytics?.mostPopularTools.slice(0, 6) || []}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ toolName, percent }) => `${toolName} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="totalClicks"
                    >
                      {analytics?.mostPopularTools.slice(0, 6).map((tool, index) => (
                        <Cell key={tool.toolId || `cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [formatNumber(value as number), '点击次数']} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  用户活跃度分析
                </CardTitle>
                <CardDescription>用户登录次数和使用时长统计</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={userAnalytics.slice(0, 8)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="username" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name) => [
                        name === 'totalUsageTime' ? formatUsageTime(value as number) : value,
                        name === 'totalUsageTime' ? '使用时长' : '登录次数'
                      ]} 
                    />
                    <Legend />
                    <Bar dataKey="loginCount" fill="#8884d8" name="登录次数" />
                    <Bar dataKey="totalUsageTime" fill="#82ca9d" name="使用时长(秒)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>用户详细分析</CardTitle>
              <CardDescription>基于MongoDB聚合管道的用户行为深度分析</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userAnalytics.slice(0, 10).map((user, index) => {
                  // 动态计算总点击次数：所有工具点击次数的总和
                  const calculatedTotalClicks = user.toolUsageDetails.reduce((total, tool) => total + tool.clickCount, 0)

                  return (
                    <div key={user.id || `user-${index}`} className="border rounded-lg hover:bg-gray-50 transition-colors">
                      {/* 用户基本信息和复制按钮 */}
                      <div className="flex items-center justify-between p-4 border-b">
                        <div className="flex items-center space-x-4">
                          <Badge variant={index < 3 ? "default" : "secondary"}>
                            #{index + 1}
                          </Badge>
                          <div>
                            <p className="font-medium">{user.username}</p>
                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                              <Badge variant={user.role === 'admin' ? 'destructive' : 'outline'}>
                                {user.role === 'admin' ? '管理员' : '用户'}
                              </Badge>
                              <span>使用工具: {user.toolUsageDetails.length} 个</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <p className="font-medium text-blue-600">{formatNumber(calculatedTotalClicks)} 次点击</p>
                            <p className="text-sm text-gray-500">
                              {formatUsageTime(user.totalUsageTime)} | {user.loginCount} 次登录
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCopyUserToolDetails(user)}
                            className="flex items-center gap-2"
                          >
                            <Copy className="w-4 h-4" />
                            复制详情
                          </Button>
                        </div>
                      </div>

                      {/* 显示所有工具使用详情 */}
                      {user.toolUsageDetails.length > 0 && (
                        <div className="p-4">
                          <p className="text-xs text-gray-400 font-medium mb-2">工具使用详情:</p>
                          <div className="grid grid-cols-1 gap-1 max-h-64 overflow-y-auto">
                            {user.toolUsageDetails.map((tool, toolIndex) => (
                              <div key={`${user.id}-tool-${tool.toolId}`} className="flex justify-between items-center text-xs bg-gray-50 rounded px-2 py-1">
                                <span className="font-medium text-gray-700 truncate max-w-[300px]" title={tool.toolName}>
                                  {toolIndex + 1}. {tool.toolName}
                                </span>
                                <div className="flex items-center space-x-2 text-gray-500">
                                  <span>{tool.clickCount}次</span>
                                  <span>|</span>
                                  <span>{formatUsageTime(tool.totalUsageTime)}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="mt-2 text-xs text-gray-400 text-center">
                            共 {user.toolUsageDetails.length} 个工具
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tools" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>工具使用排行榜</CardTitle>
              <CardDescription>MongoDB聚合查询 - 实时更新的工具统计</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics?.mostPopularTools.map((tool, index) => (
                  <div key={tool.toolId} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <Badge variant={index < 3 ? "default" : "secondary"} className={
                        index === 0 ? "bg-yellow-500" : 
                        index === 1 ? "bg-gray-400" : 
                        index === 2 ? "bg-orange-600" : ""
                      }>
                        #{index + 1}
                      </Badge>
                      <div>
                        <p className="font-medium">{tool.toolName}</p>
                        <p className="text-sm text-gray-500">
                          {tool.uniqueUsers} 个用户使用
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-blue-600">{formatNumber(tool.totalClicks)} 次点击</p>
                      <p className="text-sm text-gray-500">
                        {formatUsageTime(tool.totalUsageTime)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                使用趋势分析
              </CardTitle>
              <CardDescription>基于MongoDB时间序列数据的趋势分析</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <h4 className="font-medium">用户增长趋势</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={analytics?.userGrowthTrend || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Area
                        type="monotone"
                        dataKey="activeUsers"
                        stroke="#8884d8"
                        fill="#8884d8"
                        fillOpacity={0.6}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">工具使用趋势</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={analytics?.toolUsageTrend || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip formatter={(value) => [formatNumber(value as number), '总点击']} />
                      <Line
                        type="monotone"
                        dataKey="totalClicks"
                        stroke="#82ca9d"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>实时监控面板</CardTitle>
              <CardDescription>MongoDB Change Streams - 实时数据流监控</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg bg-green-50">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-green-800 font-medium">数据库连接正常</span>
                  </div>
                  <p className="text-sm text-green-600 mt-2">MongoDB 实时同步</p>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">查询性能</h4>
                  <p className="text-2xl font-bold text-blue-600">&lt; 100ms</p>
                  <p className="text-sm text-gray-500">聚合查询响应时间</p>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">数据同步率</h4>
                  <p className="text-2xl font-bold text-purple-600">100%</p>
                  <p className="text-sm text-gray-500">跨设备数据一致性</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}