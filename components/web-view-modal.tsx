"use client"

import React, { useState, useEffect } from "react"
import { Dialog, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"

// 自定义DialogContent，移除默认的max-w-lg限制
const CustomDialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
        className
      )}
      {...props}
    >
      {children}
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
))
CustomDialogContent.displayName = "CustomDialogContent"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  RefreshCw,
  AlertCircle,
  Loader2,
  Maximize2,
  Minimize2
} from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/lib/auth/auth-context"
import { apiCall } from "@/lib/tauri-api"

interface WebViewModalProps {
  isOpen: boolean
  onClose: () => void
  tool: {
    id: number
    name: string
    url: string
    category: string
    description: string
  } | null
}

export function WebViewModal({ isOpen, onClose, tool }: WebViewModalProps) {
  const { state } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(true)
  const [startTime, setStartTime] = useState<number | null>(null)
  const [frameError, setFrameError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && tool) {
      setIsLoading(true)
      setHasError(false)
      setFrameError(null)
      setIsFullscreen(true) // 每次打开工具时默认最大化
      setStartTime(Date.now()) // 记录开始时间

      // 检测X-Frame-Options错误
      const checkFrameError = () => {
        const iframe = document.getElementById('webview-iframe') as HTMLIFrameElement
        if (iframe) {
          try {
            // 尝试访问iframe内容，如果被X-Frame-Options阻止会抛出错误
            iframe.contentWindow?.location.href
          } catch (error) {
            console.error('Frame access error:', error)
            setFrameError('该网站不允许在框架中显示')
            setHasError(true)
            setIsLoading(false)
          }
        }
      }

      // 延迟检查，给iframe时间加载
      const timer = setTimeout(checkFrameError, 3000)
      return () => clearTimeout(timer)
    }
  }, [isOpen, tool])

  // 追踪工具使用时长
  const trackToolUsage = async () => {
    if (state.user && tool && startTime) {
      const duration = Math.floor((Date.now() - startTime) / 1000) // 计算使用时长（秒）
      if (duration > 0) { // 只记录有效的使用时长
        try {
          await apiCall('track_user_activity', {
            userId: state.user.id,
            activityType: 'tool_usage',
            toolId: tool.id,
            toolName: tool.name,
            duration: duration
          })
          console.log(`记录工具使用时长: ${tool.name} - ${duration}秒`)
        } catch (error) {
          console.error('记录工具使用时长失败:', error)
        }
      }
    }
  }

  // 修改onClose处理函数
  const handleClose = () => {
    trackToolUsage()
    onClose()
  }

  // 键盘快捷键支持
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        event.preventDefault()
        event.stopPropagation()
        // 如果是全屏模式，先退出全屏，再关闭弹窗
        if (isFullscreen) {
          setIsFullscreen(false)
          // 延迟关闭，让用户看到退出全屏的效果
          setTimeout(() => handleClose(), 100)
        } else {
          handleClose()
        }
      }
      if (event.key === 'F5' && isOpen) {
        event.preventDefault()
        event.stopPropagation()
        handleRefresh()
      }
    }

    if (isOpen) {
      // 添加到document和window上，确保能捕获到事件
      document.addEventListener('keydown', handleKeyDown, true)
      window.addEventListener('keydown', handleKeyDown, true)

      return () => {
        document.removeEventListener('keydown', handleKeyDown, true)
        window.removeEventListener('keydown', handleKeyDown, true)
      }
    }
  }, [isOpen, isFullscreen, handleClose])

  const handleIframeLoad = () => {
    setIsLoading(false)
    setHasError(false)
  }

  const handleIframeError = () => {
    setIsLoading(false)
    setHasError(true)
  }



  const handleRefresh = () => {
    setIsLoading(true)
    setHasError(false)
    // 强制刷新iframe
    const iframe = document.getElementById('webview-iframe') as HTMLIFrameElement
    if (iframe) {
      iframe.src = iframe.src
    }
  }



  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }





  // 监听浏览器全屏状态变化
  useEffect(() => {
    const handleFullscreenChange = () => {
      // 如果浏览器退出了全屏，同步更新我们的状态
      if (!document.fullscreenElement && isFullscreen) {
        setIsFullscreen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('fullscreenchange', handleFullscreenChange)
      return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [isOpen, isFullscreen])



  if (!tool) return null

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <CustomDialogContent
        className={`p-0 overflow-hidden transition-all duration-300 flex flex-col ${
          isFullscreen
            ? "w-[98vw] h-[98vh] max-w-[98vw] max-h-[98vh]"
            : "max-w-6xl max-h-[85vh] w-[90vw] h-[85vh]"
        }`}
        style={isFullscreen ? {
          width: '98vw',
          height: '98vh',
          maxWidth: '98vw',
          maxHeight: '98vh'
        } : {
          maxWidth: '72rem',
          maxHeight: '85vh',
          width: '90vw',
          height: '85vh'
        }}
      >
        {/* Header */}
        <DialogHeader className="px-6 py-3 border-b bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-700 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
                {tool.name}
              </DialogTitle>
              <Badge variant="secondary" className="text-xs flex-shrink-0">
                {tool.category}
              </Badge>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none p-1"
                title="刷新"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </button>

              <button
                onClick={toggleFullscreen}
                className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none p-1"
                title={isFullscreen ? "退出全屏" : "全屏显示"}
              >
                {isFullscreen ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
              </button>

              <button
                onClick={handleClose}
                className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none p-1"
                title="关闭"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="relative flex-1 bg-white dark:bg-gray-900 overflow-hidden">
          {/* Loading State */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-800 z-10">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-300">正在加载工具...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {hasError && !isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-800 z-10">
              <div className="text-center max-w-md">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  无法在应用内显示
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {frameError || "该工具不支持在应用内显示，这通常是由于网站的安全策略限制。"}
                </p>
                <div className="space-y-2">
                  <Button
                    onClick={async () => {
                      try {
                        // 使用Tauri打开外部浏览器
                        const { invoke } = await import('@tauri-apps/api/core')
                        await invoke('open_url', { url: tool.url })
                        toast.success('已在外部浏览器中打开工具')
                        onClose()
                      } catch (error) {
                        console.error('打开外部浏览器失败:', error)
                        // 降级到window.open
                        window.open(tool.url, '_blank')
                        toast.success('已在外部浏览器中打开工具')
                        onClose()
                      }
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    在外部浏览器中打开
                  </Button>
                  <Button onClick={handleRefresh} variant="outline" className="w-full">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    重新尝试
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* WebView iframe */}
          <iframe
            id="webview-iframe"
            src={tool.url}
            className="w-full h-full border-0 block"
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            referrerPolicy="no-referrer-when-downgrade"
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-presentation allow-top-navigation-by-user-activation"
            allow="accelerometer; autoplay; camera; clipboard-read; clipboard-write; encrypted-media; fullscreen; geolocation; gyroscope; magnetometer; microphone; midi; payment; picture-in-picture; publickey-credentials-get; screen-wake-lock; web-share"
            allowFullScreen
            style={{
              border: 'none',
              width: '100%',
              height: '100%'
            }}
          />
        </div>
      </CustomDialogContent>
    </Dialog>
  )
}
