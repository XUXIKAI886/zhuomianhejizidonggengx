"use client"

import { useEffect, useState } from 'react'
import { check } from '@tauri-apps/plugin-updater'
import { relaunch } from '@tauri-apps/plugin-process'
import { invoke } from '@tauri-apps/api/core'
import { getVersion } from '@tauri-apps/api/app'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { Download, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

interface UpdateInfo {
  version: string
  date: string
  body: string
}

export function UpdateChecker() {
  const [updateAvailable, setUpdateAvailable] = useState(false)
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null)
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState(0)
  const [isChecking, setIsChecking] = useState(false)
  const [showDialog, setShowDialog] = useState(false)
  const [currentVersion, setCurrentVersion] = useState<string>('1.0.9')

  // 获取当前应用版本
  const getCurrentVersion = async () => {
    try {
      const version = await getVersion()
      setCurrentVersion(version)
      return version
    } catch (error) {
      console.error('获取应用版本失败:', error)
      return '1.0.9' // 默认版本
    }
  }

  // 初始化时获取版本号
  useEffect(() => {
    getCurrentVersion()
  }, [])

  // 强制打开开发者工具
  const forceOpenDevtools = async () => {
    try {
      await invoke('open_devtools')
      toast.success('开发者工具已打开', {
        description: '如果没有看到开发者工具窗口，请检查任务栏'
      })
    } catch (error) {
      console.error('打开开发者工具失败:', error)
      toast.error('无法打开开发者工具', {
        description: String(error)
      })
    }
  }

  // 检查更新
  const checkForUpdates = async (showToast = true) => {
    // ✅ 修复后的Tauri环境检测逻辑
    const isTauriEnvironment = () => {
      // 方法1: 检查Tauri全局对象
      if (typeof window !== 'undefined' && window.__TAURI__) {
        console.log('Tauri环境检测: 通过__TAURI__全局对象检测成功')
        return true
      }
      
      // 方法2: 检查Tauri相关API函数
      if (typeof window !== 'undefined' && typeof window.__TAURI_INVOKE__ === 'function') {
        console.log('Tauri环境检测: 通过__TAURI_INVOKE__函数检测成功')
        return true
      }
      
      // 方法3: 检查UserAgent中的Tauri标识
      if (navigator?.userAgent?.includes('Tauri')) {
        console.log('Tauri环境检测: 通过UserAgent检测成功')
        return true
      }
      
      // 方法4: 检查是否为桌面应用特有的协议
      if (window.location.protocol === 'tauri:') {
        console.log('Tauri环境检测: 通过tauri://协议检测成功')
        return true
      }
      
      console.log('Tauri环境检测: 所有检测方法均未通过，判定为非Tauri环境')
      return false
    }

    const isInTauri = isTauriEnvironment()

    console.log('更新检查环境信息:', {
      protocol: window.location.protocol,
      href: window.location.href,
      userAgent: navigator.userAgent,
      __TAURI__: !!window.__TAURI__,
      __TAURI_INVOKE__: typeof window.__TAURI_INVOKE__,
      isInTauri
    })

    if (!isInTauri) {
      console.log('检测到非Tauri环境，跳过更新检查')
      if (showToast) {
        toast.info('更新功能仅在桌面应用中可用', {
          description: '请下载桌面版本以使用自动更新功能',
          icon: <AlertCircle className="h-4 w-4" />
        })
      }
      return
    }

    // 在Tauri桌面环境中，开始更新检查
    console.log('Tauri桌面环境检测成功，开始更新检查')

    try {
      setIsChecking(true)
      console.log('UpdateChecker: 开始检查更新...')

      // 尝试直接调用 Tauri API
      let update
      try {
        update = await check()
        console.log('UpdateChecker: 更新检查结果:', update)
      } catch (apiError) {
        console.error('UpdateChecker: Tauri API调用失败:', apiError)

        // 如果API调用失败，尝试手动检查
        if (showToast) {
          toast.error('更新API调用失败', {
            description: `错误: ${String(apiError)}`,
            icon: <AlertCircle className="h-4 w-4" />,
            duration: 10000
          })
        }
        throw apiError
      }

      if (update?.available) {
        console.log('UpdateChecker: 发现新版本:', update.version)
        setUpdateInfo({
          version: update.version,
          date: update.date || new Date().toISOString(),
          body: update.body || '新版本可用'
        })
        setUpdateAvailable(true)
        setShowDialog(true)

        if (showToast) {
          toast.success(`🎉 发现新版本 v${update.version}`, {
            description: '点击立即更新到最新版本',
            duration: 8000,
            action: {
              label: '立即更新',
              onClick: () => {
                setShowDialog(true)
                // 可选：直接开始下载
                // downloadAndInstall()
              }
            }
          })
        }
      } else {
        if (showToast) {
          toast.success('✅ 当前已是最新版本', {
            description: `版本 v${currentVersion} 无需更新`,
            duration: 4000,
            icon: <CheckCircle className="h-4 w-4" />
          })
        }
      }
    } catch (error) {
      console.error('检查更新失败:', error)

      // 更详细的错误处理
      let errorMessage = '请检查网络连接后重试'
      const errorStr = String(error)

      if (errorStr.includes('not allowed') || errorStr.includes('Permissions')) {
        errorMessage = '更新权限不足，请重启应用后重试'
      } else if (errorStr.includes('network') || errorStr.includes('fetch')) {
        errorMessage = '网络连接失败，请检查网络设置'
      } else if (errorStr.includes('timeout')) {
        errorMessage = '连接超时，请稍后重试'
      }

      if (showToast) {
        toast.error('检查更新失败', {
          description: errorMessage,
          icon: <AlertCircle className="h-4 w-4" />
        })
      }
    } finally {
      setIsChecking(false)
    }
  }

  // 下载并安装更新
  const downloadAndInstall = async () => {
    if (!updateInfo) return

    try {
      setIsDownloading(true)
      setDownloadProgress(0)

      const update = await check()
      if (!update?.available) {
        toast.error('更新不可用')
        return
      }

      // 监听下载进度
      let downloaded = 0
      let contentLength = 0
      
      await update.downloadAndInstall((event) => {
        switch (event.event) {
          case 'Started':
            contentLength = event.data.contentLength || 0
            toast.info('开始下载更新...')
            break
          case 'Progress':
            downloaded += event.data.chunkLength || 0
            if (contentLength > 0) {
              const progress = Math.round((downloaded / contentLength) * 100)
              setDownloadProgress(progress)
            }
            break
          case 'Finished':
            setDownloadProgress(100)
            toast.success('更新下载完成，准备重启应用...')
            break
        }
      })

      // 重启应用以应用更新
      setTimeout(async () => {
        await relaunch()
      }, 1000)

    } catch (error) {
      console.error('更新失败:', error)
      toast.error('更新失败', {
        description: '请稍后重试或手动下载更新',
        icon: <AlertCircle className="h-4 w-4" />
      })
    } finally {
      setIsDownloading(false)
    }
  }

  // 应用启动时自动检查更新
  useEffect(() => {
    // 使用与checkForUpdates相同的环境检测逻辑
    const isTauriEnvironment = () => {
      // 方法1: 检查Tauri全局对象
      if (typeof window !== 'undefined' && window.__TAURI__) {
        return true
      }
      
      // 方法2: 检查Tauri相关API函数
      if (typeof window !== 'undefined' && typeof window.__TAURI_INVOKE__ === 'function') {
        return true
      }
      
      // 方法3: 检查UserAgent中的Tauri标识
      if (navigator?.userAgent?.includes('Tauri')) {
        return true
      }
      
      // 方法4: 检查是否为桌面应用特有的协议
      if (window.location.protocol === 'tauri:') {
        return true
      }
      
      return false
    }

    // 只在Tauri环境中自动检查更新
    if (!isTauriEnvironment()) {
      console.log('UpdateChecker: 非Tauri环境，跳过自动更新检查')
      return
    }

    console.log('UpdateChecker: Tauri环境检测成功，将在3秒后检查更新')

    // 显示启动时的更新检查提示
    toast.info('🔍 正在检查应用更新...', {
      description: '启动时自动检查最新版本',
      duration: 2500,
      icon: <RefreshCw className="h-4 w-4 animate-spin" />
    })

    // 延迟3秒后自动检查更新，避免影响应用启动
    const timer = setTimeout(() => {
      console.log('UpdateChecker: 开始自动检查更新')
      checkForUpdates(true) // 改为 true，显示检查结果提示
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <>
      {/* 手动检查更新按钮 */}
      <div className="flex gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => checkForUpdates(true)}
          disabled={isChecking}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isChecking ? 'animate-spin' : ''}`} />
          {isChecking ? '检查中...' : '检查更新'}
        </Button>

        {/* 调试按钮 */}
        <Button
          variant="outline"
          size="sm"
          onClick={forceOpenDevtools}
          className="gap-2"
        >
          <AlertCircle className="h-4 w-4" />
          调试工具
        </Button>
      </div>

      {/* 更新对话框 */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              发现新版本
            </DialogTitle>
            <DialogDescription>
              有新版本可用，建议立即更新以获得最佳体验。
            </DialogDescription>
          </DialogHeader>

          {updateInfo && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">新版本:</span>
                  <p className="text-muted-foreground">v{updateInfo.version}</p>
                </div>
                <div>
                  <span className="font-medium">发布时间:</span>
                  <p className="text-muted-foreground">
                    {new Date(updateInfo.date).toLocaleDateString('zh-CN')}
                  </p>
                </div>
              </div>

              {updateInfo.body && (
                <div>
                  <span className="font-medium text-sm">更新内容:</span>
                  <div className="mt-2 p-3 bg-muted rounded-md text-sm">
                    {updateInfo.body}
                  </div>
                </div>
              )}

              {isDownloading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>下载进度</span>
                    <span>{downloadProgress}%</span>
                  </div>
                  <Progress value={downloadProgress} className="h-2" />
                </div>
              )}
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowDialog(false)}
              disabled={isDownloading}
            >
              稍后更新
            </Button>
            <Button
              onClick={downloadAndInstall}
              disabled={isDownloading}
              className="gap-2"
            >
              {isDownloading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  下载中...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  立即更新
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
