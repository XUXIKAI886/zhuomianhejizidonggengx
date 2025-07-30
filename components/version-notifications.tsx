"use client"

import { useState, useEffect } from "react"
import { Bell, X, Sparkles, Shield, Zap, Bug, FileText, Calendar, ExternalLink, Users, Settings, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import {
  versionHistory,
  getUnreadCount,
  typeStyles,
  typeLabels,
  formatDate,
  getVersionStats,
  type VersionUpdate
} from "@/lib/version-data"

// 图标组件映射
const iconMap = {
  sparkles: Sparkles,
  shield: Shield,
  zap: Zap,
  bug: Bug,
  file: FileText,
  users: Users,
  settings: Settings,
  globe: Globe
}

export function VersionNotifications() {
  const [open, setOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [expandedVersions, setExpandedVersions] = useState<Set<string>>(new Set())

  // 计算未读通知数量
  useEffect(() => {
    setUnreadCount(getUnreadCount())

    // 从本地存储读取已读状态
    const lastReadVersion = localStorage.getItem('lastReadVersion')
    if (lastReadVersion) {
      const lastReadIndex = versionHistory.findIndex(v => v.version === lastReadVersion)
      if (lastReadIndex >= 0) {
        setUnreadCount(lastReadIndex)
      }
    }
  }, [])

  // 标记所有通知为已读
  const markAllAsRead = () => {
    setUnreadCount(0)
    localStorage.setItem('lastReadVersion', versionHistory[0]?.version || '1.0.0')
  }

  // 切换版本详情展开状态
  const toggleVersionExpanded = (version: string) => {
    const newExpanded = new Set(expandedVersions)
    if (newExpanded.has(version)) {
      newExpanded.delete(version)
    } else {
      newExpanded.add(version)
    }
    setExpandedVersions(newExpanded)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all duration-200"
          onClick={() => {
            setOpen(!open)
            if (!open) markAllAsRead()
          }}
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-rose-400 to-pink-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
              <span className="text-xs font-bold text-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            </div>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent 
        className="w-96 p-0 shadow-2xl border-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl" 
        align="end"
        sideOffset={8}
      >
        {/* 头部 */}
        <div className="p-4 border-b border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <Bell className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">版本更新</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {versionHistory.length} 个版本历史
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={() => setOpen(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* 快速操作按钮 */}
          {unreadCount > 0 && (
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-7 px-3 flex-1 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                onClick={markAllAsRead}
              >
                标记全部已读
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-7 px-3 flex-1 hover:bg-green-50 dark:hover:bg-green-900/20"
                onClick={() => {
                  const latestVersion = versionHistory[0]
                  if (latestVersion?.downloadUrl) {
                    window.open(latestVersion.downloadUrl, '_blank')
                  }
                }}
              >
                查看最新版本
              </Button>
            </div>
          )}
        </div>

        {/* 版本列表 */}
        <ScrollArea className="h-96">
          <div className="p-2">
            {versionHistory.map((update, index) => {
              const IconComponent = iconMap[update.features[0]?.icon] || Sparkles
              
              return (
                <div key={update.version} className="mb-3">
                  <div className="group relative p-4 rounded-xl border border-gray-200/50 dark:border-gray-700/50 hover:border-blue-300/50 dark:hover:border-blue-600/50 hover:shadow-lg transition-all duration-200 bg-white/50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800">
                    {/* 版本头部 */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-lg flex items-center justify-center">
                          <IconComponent className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-lg text-gray-900 dark:text-gray-100">
                              v{update.version}
                            </span>
                            <Badge className={`text-xs px-2 py-1 ${typeStyles[update.type]}`}>
                              {typeLabels[update.type]}
                            </Badge>
                            {update.isNew && (
                              <Badge variant="secondary" className="text-xs px-2 py-1 bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400">
                                NEW
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center space-x-1 mt-1">
                            <Calendar className="w-3 h-3 text-gray-400" />
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {formatDate(update.date)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 更新标题和描述 */}
                    <div className="mb-3">
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                        {update.title}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                        {update.description}
                      </p>
                    </div>

                    {/* 功能特性列表 */}
                    <div className="space-y-2 mb-3">
                      {/* 始终显示的功能 */}
                      {update.features.slice(0, 3).map((feature, featureIndex) => {
                        const FeatureIcon = iconMap[feature.icon]
                        return (
                          <div key={featureIndex} className={`flex items-center space-x-2 transition-all duration-200 ${feature.highlight ? 'bg-blue-50 dark:bg-blue-900/20 rounded-lg px-2 py-1' : ''}`}>
                            <FeatureIcon className={`w-3 h-3 flex-shrink-0 ${feature.highlight ? 'text-blue-500 dark:text-blue-400' : 'text-gray-400'}`} />
                            <span className={`text-xs ${feature.highlight ? 'text-blue-700 dark:text-blue-300 font-medium' : 'text-gray-600 dark:text-gray-300'}`}>
                              {feature.text}
                            </span>
                          </div>
                        )
                      })}

                      {/* 可展开的额外功能 */}
                      {expandedVersions.has(update.version) && update.features.slice(3).map((feature, featureIndex) => {
                        const FeatureIcon = iconMap[feature.icon]
                        return (
                          <div key={featureIndex + 3} className={`flex items-center space-x-2 transition-all duration-200 animate-in slide-in-from-top-2 ${feature.highlight ? 'bg-blue-50 dark:bg-blue-900/20 rounded-lg px-2 py-1' : ''}`}>
                            <FeatureIcon className={`w-3 h-3 flex-shrink-0 ${feature.highlight ? 'text-blue-500 dark:text-blue-400' : 'text-gray-400'}`} />
                            <span className={`text-xs ${feature.highlight ? 'text-blue-700 dark:text-blue-300 font-medium' : 'text-gray-600 dark:text-gray-300'}`}>
                              {feature.text}
                            </span>
                          </div>
                        )
                      })}

                      {/* 展开/收起按钮 */}
                      {update.features.length > 3 && (
                        <button
                          onClick={() => toggleVersionExpanded(update.version)}
                          className="text-xs text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 ml-5 flex items-center space-x-1 transition-colors duration-200"
                        >
                          <span>
                            {expandedVersions.has(update.version)
                              ? '收起详情'
                              : `查看全部 ${update.features.length} 项功能`
                            }
                          </span>
                          <span className={`transform transition-transform duration-200 ${expandedVersions.has(update.version) ? 'rotate-180' : ''}`}>
                            ▼
                          </span>
                        </button>
                      )}
                    </div>

                    {/* 特殊标记 */}
                    <div className="flex items-center space-x-2 mb-3">
                      {update.security && (
                        <Badge variant="outline" className="text-xs px-2 py-1 bg-red-50 text-red-600 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800">
                          <Shield className="w-3 h-3 mr-1" />
                          安全更新
                        </Badge>
                      )}
                      {update.breaking && (
                        <Badge variant="outline" className="text-xs px-2 py-1 bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800">
                          重大变更
                        </Badge>
                      )}
                    </div>

                    {/* 下载链接 */}
                    {update.downloadUrl && (
                      <div className="flex justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs h-7 px-3 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-600"
                          onClick={() => window.open(update.downloadUrl, '_blank')}
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          查看详情
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  {index < versionHistory.length - 1 && (
                    <Separator className="my-3 bg-gray-200/50 dark:bg-gray-700/50" />
                  )}
                </div>
              )
            })}
          </div>
        </ScrollArea>

        {/* 底部 */}
        <div className="p-4 border-t border-gray-200/50 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/50">
          {/* 版本统计 */}
          <div className="flex items-center justify-center space-x-4 mb-3">
            {(() => {
              const stats = getVersionStats()
              return (
                <>
                  <div className="text-center">
                    <div className="text-lg font-bold text-purple-600 dark:text-purple-400">{stats.major}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">重大</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{stats.minor}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">功能</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600 dark:text-green-400">{stats.patch}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">修复</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-red-600 dark:text-red-400">{stats.security}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">安全</div>
                  </div>
                </>
              )
            })()}
          </div>

          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>自动更新服务器运行正常</span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-7 px-3 hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => window.open('https://www.yujinkeji.asia', '_blank')}
            >
              <ExternalLink className="w-3 h-3 mr-1" />
              更新服务器
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
