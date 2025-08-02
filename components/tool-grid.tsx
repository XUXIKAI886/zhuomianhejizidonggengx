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
    const categoryMatch = category === "全部工具" || tool.category === category
    const searchMatch = searchQuery === "" || 
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    
    return categoryMatch && searchMatch
  })

  const handleLaunchTool = async (tool: typeof toolsData[0]) => {
    console.log(`🎯 [前端] 用户点击工具: ${tool.name} (ID: ${tool.id})`)
    console.log(`🎯 [前端] 当前用户状态:`, state.user)
    
    // 记录工具点击统计
    if (state.user) {
      try {
        console.log(`🎯 [前端] 准备调用 track_user_activity API`)
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
        <p className="text-gray-500 dark:text-gray-400">
          {searchQuery ? `没有找到包含 "${searchQuery}" 的工具` : `${category} 分类下暂无工具`}
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredTools.map((tool) => {
        const Icon = tool.icon
        const isLaunching = launchingTool === tool.id
        
        return (
          <Card
            key={tool.id}
            className="tool-card-enhanced group relative overflow-hidden bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-white/20 dark:border-gray-700/20 shadow-lg hover:shadow-[0_20px_40px_rgba(0,0,0,0.1),0_8px_16px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_20px_40px_rgba(0,0,0,0.3),0_8px_16px_rgba(0,0,0,0.2)] transition-all duration-500 ease-out hover:scale-[1.03] hover:-translate-y-2 cursor-pointer"
          >
            {/* Featured Badge - 已移除 */}

            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 to-white/80 dark:from-gray-800/50 dark:to-gray-700/80 group-hover:from-blue-50/40 group-hover:via-indigo-50/30 group-hover:to-purple-50/40 dark:group-hover:from-blue-900/30 dark:group-hover:via-indigo-900/20 dark:group-hover:to-purple-900/30 transition-all duration-500 ease-out"></div>

            {/* Animated Border Glow */}
            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-indigo-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"></div>

            <CardHeader className="relative pb-4">
              <div className="flex items-start space-x-4">
                <div
                  className={`w-14 h-14 bg-gradient-to-br ${tool.color} rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-[0_12px_24px_rgba(0,0,0,0.15)] group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 ease-out relative overflow-hidden before:absolute before:inset-0 before:bg-white/20 before:opacity-0 group-hover:before:opacity-100 before:transition-opacity before:duration-300`}
                >
                  <Icon className="w-7 h-7 text-white relative z-10 group-hover:scale-110 transition-transform duration-300 ease-out" />
                </div>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg font-bold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-all duration-300 ease-out group-hover:translate-x-1">
                    {tool.name}
                  </CardTitle>
                  <div className="flex items-center space-x-2 mt-2">
                    <Badge variant="secondary" className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-all duration-300 ease-out">
                      {tool.category}
                    </Badge>
                    <span className="text-xs text-gray-400 dark:text-gray-500">更新于{tool.lastUpdated}</span>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="relative pt-0 space-y-4">
              <CardDescription className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-2 group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors duration-300 ease-out">
                {tool.description}
              </CardDescription>

              {/* Stats - 已移除评分和下载量 */}

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {tool.tags.slice(0, 3).map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="text-xs bg-white/50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 group-hover:bg-white/80 dark:group-hover:bg-gray-600/80 group-hover:border-blue-300 dark:group-hover:border-blue-600 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-all duration-300 ease-out group-hover:scale-105"
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
                  className={`flex-1 bg-gradient-to-r ${tool.color} hover:shadow-[0_8px_16px_rgba(0,0,0,0.15)] transition-all duration-300 ease-out group-hover:scale-105 group-hover:-translate-y-0.5 disabled:opacity-50 relative overflow-hidden before:absolute before:inset-0 before:bg-white/20 before:translate-x-[-100%] group-hover:before:translate-x-[100%] before:transition-transform before:duration-700 before:ease-out`}
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

      {/* WebView Modal */}
      <WebViewModal
        isOpen={webViewModal.isOpen}
        onClose={handleCloseWebView}
        tool={webViewModal.tool}
      />
    </div>
  )
}
