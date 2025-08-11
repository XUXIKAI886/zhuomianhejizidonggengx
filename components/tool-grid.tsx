"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Zap,
  AlertCircle,
} from "lucide-react"
import { toolsData } from "@/lib/tool-data"
import { ToolLauncher } from "@/utils/toolLauncher"
import { WebViewModal } from "@/components/web-view-modal"
import { useAuth } from "@/lib/auth/auth-context"
import { apiCall } from "@/lib/tauri-api"
// toast 导入已移除

interface ToolGridProps {
  category?: string
  searchQuery?: string
}

export function ToolGrid({ category = "全部工具", searchQuery = "" }: ToolGridProps) {
  const { state } = useAuth()
  const [launchingTool, setLaunchingTool] = useState<number | null>(null)
  const [webViewModal, setWebViewModal] = useState<{
    isOpen: boolean
    tool: typeof toolsData[0] | null
  }>({
    isOpen: false,
    tool: null
  })

  // 筛选工具
  const filteredTools = toolsData.filter(tool => {
    // 如果有搜索查询，优先按搜索结果筛选
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      return (
        tool.name.toLowerCase().includes(query) ||
        tool.description.toLowerCase().includes(query) ||
        tool.category.toLowerCase().includes(query) ||
        tool.tags.some(tag => tag.toLowerCase().includes(query))
      )
    }

    // 没有搜索查询时，按分类筛选
    return category === "全部工具" || tool.category === category
  })

  const handleLaunchTool = async (tool: typeof toolsData[0]) => {
    console.log(`🎯 [前端] 用户点击工具: ${tool.name} (ID: ${tool.id})`)
    console.log(`🎯 [前端] 当前用户状态:`, state.user)

    // 记录工具点击统计
    if (state.user) {
      try {
        console.log(`🎯 [前端] 准备调用 track_user_activity API`)
        console.log(`🎯 [前端] 调用参数:`, {
          userId: state.user.id,
          activityType: 'tool_click',
          toolId: tool.id,
          toolName: tool.name,
          duration: null
        })

        const result = await apiCall('track_user_activity', {
          userId: state.user.id,
          activityType: 'tool_click',
          toolId: tool.id,
          toolName: tool.name,
          duration: null
        })
        console.log(`✅ [前端] 工具点击记录成功: ${tool.name} (ID: ${tool.id})`, result)
      } catch (error) {
        console.error(`❌ [前端] 记录工具点击失败:`, error)
        console.error(`❌ [前端] 错误详情:`, {
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
          userId: state.user?.id,
          toolId: tool.id,
          toolName: tool.name
        })
      }
    } else {
      console.error(`❌ [前端] 用户未登录，无法记录工具点击`)
    }

    // 直接在应用内打开WebView
    setWebViewModal({
      isOpen: true,
      tool: tool
    })
    // 移除toast提示，直接打开工具
  }

  const handleCloseWebView = () => {
    setWebViewModal({
      isOpen: false,
      tool: null
    })
  }

  // handleAddToFavorites 函数已移除

  if (filteredTools.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertCircle className="w-12 h-12 text-gray-400 dark:text-gray-500 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">未找到相关工具</h3>
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          {searchQuery ? `没有找到包含 "${searchQuery}" 的工具` : `${category} 分类下暂无工具`}
        </p>
        {searchQuery && (
          <div className="text-sm text-gray-400 dark:text-gray-500">
            <p>搜索建议：</p>
            <ul className="mt-2 space-y-1">
              <li>• 尝试使用不同的关键词</li>
              <li>• 检查拼写是否正确</li>
              <li>• 使用更通用的搜索词</li>
              <li>• 尝试搜索工具分类：运营、美工、销售、人事、客服</li>
            </ul>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* 搜索结果统计 */}
      {searchQuery && (
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 bg-blue-50/50 dark:bg-blue-900/10 rounded-lg px-4 py-2 border border-blue-200/30 dark:border-blue-800/30">
          <span>
            找到 <span className="font-semibold text-blue-600 dark:text-blue-400">{filteredTools.length}</span> 个相关工具
          </span>
          {filteredTools.length > 0 && (
            <span className="text-xs">
              匹配关键词: <span className="font-medium">"{searchQuery}"</span>
            </span>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTools.map((tool) => {
        const Icon = tool.icon
        const isLaunching = launchingTool === tool.id
        
        return (
          <Card
            key={tool.id}
            className="group relative overflow-hidden bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-white/20 dark:border-gray-700/20 shadow-lg hover:shadow-xl hover:border-blue-200/50 dark:hover:border-blue-700/50 transition-all duration-200 ease-out cursor-pointer"
          >
            {/* Featured Badge - 已移除 */}

            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 to-white/80 dark:from-gray-800/50 dark:to-gray-700/80 group-hover:from-blue-50/30 group-hover:to-white/90 dark:group-hover:from-blue-900/10 dark:group-hover:to-gray-700/90 transition-all duration-200 ease-out"></div>

            <CardHeader className="relative pb-4">
              <div className="flex items-start space-x-4">
                <div
                  className={`w-14 h-14 bg-gradient-to-br ${tool.color} rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-200 ease-out`}
                >
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg font-bold text-gray-900 dark:text-gray-100 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors duration-200 ease-out line-clamp-2 h-14 flex items-center">
                    {tool.name}
                  </CardTitle>
                  <div className="flex items-center space-x-2 mt-2">
                    <Badge variant="secondary" className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 group-hover:text-blue-700 dark:group-hover:text-blue-300 group-hover:border-blue-200 dark:group-hover:border-blue-700 transition-all duration-200 ease-out">
                      {tool.category}
                    </Badge>
                    <span className="text-xs text-gray-400 dark:text-gray-500">更新于{tool.lastUpdated}</span>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="relative pt-0 space-y-4">
              <CardDescription className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-2 h-10 group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors duration-200 ease-out">
                {tool.description}
              </CardDescription>

              {/* Stats - 已移除评分和下载量 */}

              {/* Tags */}
              <div className="flex flex-wrap gap-2 h-8 items-start overflow-hidden">
                {tool.tags.slice(0, 3).map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="text-xs bg-white/50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 group-hover:bg-white/80 dark:group-hover:bg-gray-600/80 group-hover:border-gray-300 dark:group-hover:border-gray-500 transition-all duration-200 ease-out"
                  >
                    {tag}
                  </Badge>
                ))}
                {tool.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs bg-white/50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600">
                    +{tool.tags.length - 3}
                  </Badge>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2 pt-2">
                <Button
                  className={`flex-1 bg-gradient-to-r ${tool.color} hover:shadow-md transition-shadow duration-200 ease-out disabled:opacity-50`}
                  onClick={() => handleLaunchTool(tool)}
                  disabled={isLaunching}
                >
                  {isLaunching ? (
                    <>
                      <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                      启动中...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      打开工具
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )
      })}
      </div>

      {/* WebView Modal */}
      <WebViewModal
        isOpen={webViewModal.isOpen}
        onClose={handleCloseWebView}
        tool={webViewModal.tool}
      />
    </div>
  )
}
