"use client"

import { useEffect, useState } from 'react'
import { check } from '@tauri-apps/plugin-updater'
import { relaunch } from '@tauri-apps/plugin-process'
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

  // 检查更新
  const checkForUpdates = async (showToast = true) => {
    try {
      setIsChecking(true)
      const update = await check()
      
      if (update?.available) {
        setUpdateInfo({
          version: update.version,
          date: update.date || new Date().toISOString(),
          body: update.body || '新版本可用'
        })
        setUpdateAvailable(true)
        setShowDialog(true)
        
        if (showToast) {
          toast.success(`发现新版本 v${update.version}`, {
            description: '点击查看更新详情',
            action: {
              label: '查看',
              onClick: () => setShowDialog(true)
            }
          })
        }
      } else {
        if (showToast) {
          toast.success('已是最新版本', {
            description: '当前版本是最新的',
            icon: <CheckCircle className="h-4 w-4" />
          })
        }
      }
    } catch (error) {
      console.error('检查更新失败:', error)
      if (showToast) {
        toast.error('检查更新失败', {
          description: '请检查网络连接后重试',
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
    // 延迟3秒后自动检查更新，避免影响应用启动
    const timer = setTimeout(() => {
      checkForUpdates(false)
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <>
      {/* 手动检查更新按钮 */}
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
