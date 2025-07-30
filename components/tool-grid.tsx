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
// toast 导入已移除

interface ToolGridProps {
  category?: string
  searchQuery?: string
}

export function ToolGrid({ category = "全部工具", searchQuery = "" }: ToolGridProps) {
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
            className="group relative overflow-hidden bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-white/20 dark:border-gray-700/20 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] cursor-pointer"
          >
            {/* Featured Badge - 已移除 */}

            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 to-white/80 dark:from-gray-800/50 dark:to-gray-700/80 group-hover:from-blue-50/30 group-hover:to-purple-50/30 dark:group-hover:from-blue-900/20 dark:group-hover:to-purple-900/20 transition-all duration-300"></div>

            <CardHeader className="relative pb-4">
              <div className="flex items-start space-x-4">
                <div
                  className={`w-14 h-14 bg-gradient-to-br ${tool.color} rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300`}
                >
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg font-bold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {tool.name}
                  </CardTitle>
                  <div className="flex items-center space-x-2 mt-2">
                    <Badge variant="secondary" className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                      {tool.category}
                    </Badge>
                    <span className="text-xs text-gray-400 dark:text-gray-500">更新于{tool.lastUpdated}</span>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="relative pt-0 space-y-4">
              <CardDescription className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-2">
                {tool.description}
              </CardDescription>

              {/* Stats - 已移除评分和下载量 */}

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {tool.tags.slice(0, 3).map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="text-xs bg-white/50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
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
                  className={`flex-1 bg-gradient-to-r ${tool.color} hover:shadow-lg transition-all duration-200 group-hover:scale-105 disabled:opacity-50`}
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
