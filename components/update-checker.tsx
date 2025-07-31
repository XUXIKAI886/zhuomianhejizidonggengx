"use client"

import { useEffect, useState } from 'react'
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
  const [currentVersion, setCurrentVersion] = useState<string>('1.0.16')  // 修复：使用正确的初始版本

  // 获取当前应用版本
  const getCurrentVersion = async () => {
    try {
      // 在Tauri环境中尝试获取真实版本号
      if (typeof window !== 'undefined' && (window.__TAURI__ || window.__TAURI_INTERNALS__)) {
        console.log('Tauri环境检测成功，尝试获取应用版本...')

        try {
          // 首先尝试使用Tauri API获取版本
          const actualVersion = await getVersion()
          console.log('成功获取应用版本:', actualVersion)
          setCurrentVersion(actualVersion)
          return actualVersion
        } catch (tauriError) {
          console.warn('Tauri API获取版本失败，使用配置文件版本:', tauriError)

          // 如果Tauri API失败，使用配置文件版本作为fallback
          const configVersion = '1.0.16' // 从tauri.conf.json中的版本
          console.log('使用配置文件版本:', configVersion)
          setCurrentVersion(configVersion)

          // 静默处理，不显示错误toast
          return configVersion
        }
      } else {
        console.log('非Tauri环境，使用默认版本号')
        const defaultVersion = '1.0.16'
        setCurrentVersion(defaultVersion)
        return defaultVersion
      }
    } catch (error) {
      console.error('获取应用版本失败:', error)

      // 使用fallback版本号
      const fallbackVersion = '1.0.16'
      setCurrentVersion(fallbackVersion)

      return fallbackVersion
    }
  }

  // 强制打开开发者工具
  const forceOpenDevtools = async () => {
    try {
      const result = await invoke<string>('open_devtools')
      toast.success('调试模式已启用', {
        description: result + '，现在可以查看控制台日志'
      })
    } catch (error) {
      console.error('启用调试模式失败:', error)
      toast.error('启用调试模式失败', {
        description: String(error)
      })
    }
  }

  // 检查更新
  const checkForUpdates = async (showToast = true) => {
    // ✅ 修复异步竞态条件：确保使用最新版本号
    const latestVersion = await getCurrentVersion()
    console.log('CheckForUpdates使用版本号:', latestVersion)
    
    // ✅ 修复后的Tauri环境检测逻辑
    const isTauriEnvironment = () => {
      // 方法1: 检查window.__TAURI_INTERNALS__
      if (typeof window !== 'undefined' && window.__TAURI_INTERNALS__) {
        console.log('Tauri环境检测: 通过__TAURI_INTERNALS__检测成功')
        return true
      }
      
      // 方法2: 检查Tauri全局对象
      if (typeof window !== 'undefined' && window.__TAURI__) {
        console.log('Tauri环境检测: 通过__TAURI__全局对象检测成功')
        return true
      }
      
      // 方法3: 检查Tauri相关API函数
      if (typeof window !== 'undefined' && typeof window.__TAURI_INVOKE__ === 'function') {
        console.log('Tauri环境检测: 通过__TAURI_INVOKE__函数检测成功')
        return true
      }
      
      // 方法4: 检查特殊的开发模式URL特征
      if (window.location.host.includes('tauri.localhost') || window.location.host.includes('localhost')) {
        console.log('Tauri环境检测: 通过localhost检测成功 (开发模式)')
        return true
      }
      
      // 方法5: 检查UserAgent中的Tauri标识
      if (navigator?.userAgent?.includes('Tauri')) {
        console.log('Tauri环境检测: 通过UserAgent检测成功')
        return true
      }
      
      // 方法6: 检查是否为桌面应用特有的协议
      if (window.location.protocol === 'tauri:') {
        console.log('Tauri环境检测: 通过tauri://协议检测成功')
        return true
      }
      
      console.log('Tauri环境检测: 所有检测方法均未通过，判定为非Tauri环境')
      console.log('当前环境信息:', {
        protocol: window.location.protocol,
        host: window.location.host,
        href: window.location.href,
        userAgent: navigator.userAgent,
        __TAURI__: !!window.__TAURI__,
        __TAURI_INTERNALS__: !!window.__TAURI_INTERNALS__,
        __TAURI_INVOKE__: typeof window.__TAURI_INVOKE__
      })
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

      // 静默检查更新，不显示中间过程提示

      // 直接使用HTTP API检查更新，避免IPC通信问题
      let update
      try {
        console.log('UpdateChecker: 使用HTTP API检查更新...')

        const response = await fetch(`https://www.yujinkeji.asia/api/releases/windows-x86_64/${latestVersion}`)  // 修复：使用最新版本号
        const data = await response.json()

        console.log('HTTP API响应:', data)

        if (data.platforms && Object.keys(data.platforms).length > 0) {
          update = {
            available: true,
            version: data.version,
            body: data.notes,
            date: data.pub_date
          }
          console.log('UpdateChecker: 发现更新版本:', data.version)
        } else {
          update = {
            available: false,
            version: latestVersion  // 修复：使用最新版本号
          }
          console.log('UpdateChecker: 当前已是最新版本')
        }
      } catch (httpError) {
        console.error('HTTP API检查更新失败:', httpError)
        throw new Error(`更新检查失败: ${httpError}`)
      }
      
      console.log('UpdateChecker: 最终更新检查结果:', update)
      console.log('UpdateChecker: API响应类型:', typeof update)
      console.log('UpdateChecker: API响应详情:', JSON.stringify(update, null, 2))
      
      // 显示API响应详情
      // 静默处理API响应，不显示调试信息

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
            description: `版本 v${latestVersion} 无需更新`,  // 修复：使用最新版本号
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

      // 直接使用手动下载方式，避免IPC通信问题
      console.log('UpdateChecker: 开始手动下载更新...')

      // 静默准备下载，不显示中间提示

      // 直接打开GitHub Release页面让用户手动下载
      const downloadUrl = `https://github.com/XUXIKAI886/zhuomianhejizidonggengx/releases/download/v${updateInfo.version}/csch_${updateInfo.version}_x64-setup.exe`

      // 在Tauri中打开外部链接
      try {
        await invoke('open_url', { url: downloadUrl })
        toast.success('✅ 已打开下载页面', {
          description: '请下载并运行安装包完成更新',
          duration: 8000
        })
      } catch (openError) {
        console.warn('Tauri打开URL失败，使用浏览器打开:', openError)
        // 如果invoke失败，使用window.open作为fallback
        window.open(downloadUrl, '_blank')
        toast.success('✅ 已打开下载页面', {
          description: '请下载并运行安装包完成更新',
          duration: 8000
        })
      }

      setShowDialog(false)

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
    // 优化：确保版本获取完成后再检查更新
    const initializeAndCheckUpdates = async () => {
      try {
        // 首先获取当前版本
        const version = await getCurrentVersion()
        console.log('初始化获取版本成功:', version)
        
        // 检查是否在Tauri环境中
        const isInTauri = typeof window !== 'undefined' && 
          (window.__TAURI_INTERNALS__ || window.__TAURI__ || 
           typeof window.__TAURI_INVOKE__ === 'function' ||
           window.location.host.includes('tauri.localhost') ||
           navigator?.userAgent?.includes('Tauri') ||
           window.location.protocol === 'tauri:')

        if (!isInTauri) {
          console.log('UpdateChecker: 非Tauri环境，跳过自动更新检查')
          return
        }

        console.log('UpdateChecker: Tauri环境检测成功，将在3秒后检查更新')

        // 延迟3秒后自动检查更新，现在版本已经获取完成
        setTimeout(async () => {
          console.log('UpdateChecker: 开始自动检查更新')
          try {
            await checkForUpdates(true)
          } catch (error) {
            console.error('自动更新检查失败:', error)
            toast.error('自动更新检查失败', {
              description: `错误: ${String(error)}`,
              duration: 5000
            })
          }
        }, 3000)
        
      } catch (error) {
        console.error('初始化版本检查失败:', error)
      }
    }

    initializeAndCheckUpdates()
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
