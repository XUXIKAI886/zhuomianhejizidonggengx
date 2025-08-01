'use client'

import { useEffect, ReactNode } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/lib/auth/auth-context'
import { Card, CardContent } from '@/components/ui/card'

interface AuthGuardProps {
  children: ReactNode
  requiredRole?: 'admin' | 'user'
  fallback?: ReactNode
}

export function AuthGuard({ children, requiredRole, fallback }: AuthGuardProps) {
  const { state } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // 如果还在加载中，不做任何操作
    if (state.loading) return

    // 如果未认证且不在登录页，重定向到登录页
    if (!state.isAuthenticated && pathname !== '/login') {
      router.push('/login')
      return
    }

    // 如果已认证但在登录页，重定向到相应页面
    if (state.isAuthenticated && pathname === '/login') {
      if (state.user?.role === 'admin') {
        router.push('/admin')
      } else {
        router.push('/')
      }
      return
    }

    // 检查角色权限
    if (requiredRole && state.user && state.user.role !== requiredRole) {
      // 权限不足，重定向到主页
      router.push('/')
      return
    }
  }, [state.loading, state.isAuthenticated, state.user, pathname, router, requiredRole])

  // 加载状态
  if (state.loading) {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
          <Card className="w-[300px]">
            <CardContent className="flex items-center justify-center py-8">
              <div className="flex items-center space-x-2">
                <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                <span className="text-sm text-muted-foreground">验证身份中...</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    )
  }

  // 未认证且不在登录页
  if (!state.isAuthenticated && pathname !== '/login') {
    return null // 将重定向到登录页
  }

  // 权限不足
  if (requiredRole && state.user && state.user.role !== requiredRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <Card className="w-[400px]">
          <CardContent className="text-center py-8">
            <div className="space-y-4">
              <div className="text-6xl">🚫</div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">权限不足</h2>
                <p className="text-sm text-gray-600 mt-2">
                  您没有访问此页面的权限
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}

// 管理员页面保护组件
export function AdminGuard({ children }: { children: ReactNode }) {
  return (
    <AuthGuard requiredRole="admin">
      {children}
    </AuthGuard>
  )
}

// 用户页面保护组件
export function UserGuard({ children }: { children: ReactNode }) {
  return (
    <AuthGuard requiredRole="user">
      {children}
    </AuthGuard>
  )
}
