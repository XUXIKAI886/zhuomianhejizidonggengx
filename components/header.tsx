"use client"

import { Search, Settings, Moon, Sun, User, Bell, Maximize2, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { UpdateChecker } from "./update-checker"
import { VersionNotifications } from "./version-notifications"
import { useAuth } from "@/lib/auth/auth-context"

export function Header() {
  const { theme, setTheme } = useTheme()
  const { state, logout } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  // 避免水合不匹配
  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  // 获取用户名首字母作为头像
  const getUserInitials = (username: string) => {
    return username.charAt(0).toUpperCase()
  }

  return (
    <>
      {/* 隐藏的更新检查器，用于后台自动检查更新 */}
      <div className="hidden">
        <UpdateChecker />
      </div>
      
      <header className="h-16 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50 flex items-center shadow-sm">
      {/* Logo and Title - Fixed width to match sidebar */}
      <div className="w-72 flex items-center space-x-4 px-6">
        <div className="relative">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-300 to-purple-300 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-lg">T</span>
          </div>
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-white dark:border-gray-800"></div>
        </div>
        <div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
            呈尚策划工具箱
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">Desktop Edition</p>
        </div>
      </div>

      {/* Main content area - matches the main layout */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            {/* Search Bar - Aligned with main content */}
            <div className="flex-1 max-w-2xl">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5 group-focus-within:text-blue-500 dark:group-focus-within:text-blue-400 transition-colors" />
                <Input
                  placeholder="搜索工具、分类或功能..."
                  className="pl-12 pr-4 h-11 bg-gray-50/80 dark:bg-gray-800/80 border-gray-200/50 dark:border-gray-600/50 focus:bg-white dark:focus:bg-gray-700 focus:border-blue-300 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/20 rounded-xl transition-all duration-200 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Badge variant="secondary" className="text-xs px-2 py-1">
                    Ctrl+K
                  </Badge>
                </div>
              </div>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-2 ml-8">
              <VersionNotifications />
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl"
                onClick={toggleTheme}
                title={theme === 'dark' ? '切换到亮色模式' : '切换到深色模式'}
              >
                {mounted && theme === 'dark' ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </Button>
              <Button variant="ghost" size="icon" className="hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl">
                <Maximize2 className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl">
                <Settings className="w-5 h-5" />
              </Button>

              <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-2"></div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800">
                    <Avatar className="h-9 w-9 ring-2 ring-white/20 dark:ring-gray-700/50 shadow-lg">
                      <AvatarImage src="/user-avatar.svg" alt="用户头像" className="object-cover" />
                      <AvatarFallback className="bg-gradient-to-br from-blue-300 via-purple-300 to-indigo-400 text-white font-bold text-sm shadow-inner">
                        <div className="flex items-center justify-center w-full h-full">
                          <span className="drop-shadow-sm">
                            {state.user ? getUserInitials(state.user.username) : '呈'}
                          </span>
                        </div>
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64 p-2" align="end" forceMount>
                  <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg mb-2">
                    <Avatar className="h-10 w-10 ring-2 ring-blue-200/50 dark:ring-blue-700/30 shadow-lg">
                      <AvatarImage src="/user-avatar.svg" alt="用户头像" className="object-cover" />
                      <AvatarFallback className="bg-gradient-to-br from-blue-300 via-purple-300 to-indigo-400 text-white font-bold shadow-inner">
                        <div className="flex items-center justify-center w-full h-full">
                          <span className="drop-shadow-sm">
                            {state.user ? getUserInitials(state.user.username) : '呈'}
                          </span>
                        </div>
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {state.user?.username || '未登录'}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {state.user?.role === 'admin' ? '管理员' : '普通用户'}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuItem className="rounded-lg">
                    <User className="mr-3 h-4 w-4" />
                    <span>个人资料</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="rounded-lg">
                    <Settings className="mr-3 h-4 w-4" />
                    <span>偏好设置</span>
                  </DropdownMenuItem>
                  {state.user?.role === 'admin' && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="rounded-lg"
                        onClick={() => router.push('/admin')}
                      >
                        <Settings className="mr-3 h-4 w-4" />
                        <span>后台管理</span>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="rounded-lg text-rose-400 dark:text-rose-400 focus:text-rose-400 dark:focus:text-rose-400"
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-3 h-4 w-4" />
                    <span>退出登录</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    </header>
    </>
  )
}
