'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Eye, EyeOff, User, Lock, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAuth } from '@/lib/auth/auth-context'

// LocalStorage键名
const SAVED_USERNAME_KEY = 'chengshang_saved_username'
const SAVED_PASSWORD_KEY = 'chengshang_saved_password'
const REMEMBER_ME_KEY = 'chengshang_remember_me'
const AUTO_LOGIN_KEY = 'chengshang_auto_login'

// 表单验证Schema
const loginSchema = z.object({
  username: z.string().min(1, '请输入用户名').min(3, '用户名至少3个字符'),
  password: z.string().min(1, '请输入密码').min(6, '密码至少6个字符'),
  rememberMe: z.boolean().default(false),
  autoLogin: z.boolean().default(false),
})

type LoginFormValues = z.infer<typeof loginSchema>

// 从localStorage获取保存的值
const getSavedValue = (key: string): string => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(key) || ''
  }
  return ''
}

const getSavedBoolean = (key: string): boolean => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(key) === 'true'
  }
  return false
}

export default function LoginPage() {
  const router = useRouter()
  const { state, login, clearError } = useAuth()
  const [showPassword, setShowPassword] = useState(false)

  // 确保样式正确加载
  useEffect(() => {
    // 强制重新渲染以确保Tailwind样式加载
    const timer = setTimeout(() => {
      document.body.classList.add('login-page-loaded')
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  // 表单配置 - 从localStorage恢复保存的值
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: getSavedValue(SAVED_USERNAME_KEY),
      password: getSavedValue(SAVED_PASSWORD_KEY),
      rememberMe: getSavedBoolean(REMEMBER_ME_KEY),
      autoLogin: getSavedBoolean(AUTO_LOGIN_KEY),
    },
  })

  // 如果已经登录，重定向到相应页面
  useEffect(() => {
    if (state.isAuthenticated && state.user) {
      if (state.user.role === 'admin') {
        router.push('/admin')
      } else {
        router.push('/')
      }
    }
  }, [state.isAuthenticated, state.user, router])

  // 清除错误信息当表单值改变时
  useEffect(() => {
    if (state.error) {
      clearError()
    }
  }, [form.watch('username'), form.watch('password')])

  // 登录提交处理
  const onSubmit = async (values: LoginFormValues) => {
    // 保存用户名、密码和勾选状态到localStorage
    if (typeof window !== 'undefined') {
      if (values.rememberMe) {
        localStorage.setItem(SAVED_USERNAME_KEY, values.username)
        localStorage.setItem(SAVED_PASSWORD_KEY, values.password)
        localStorage.setItem(REMEMBER_ME_KEY, 'true')
      } else {
        // 如果取消勾选"记住我"，清除保存的用户名和密码
        localStorage.removeItem(SAVED_USERNAME_KEY)
        localStorage.removeItem(SAVED_PASSWORD_KEY)
        localStorage.removeItem(REMEMBER_ME_KEY)
      }

      // 保存自动登录状态
      if (values.autoLogin) {
        localStorage.setItem(AUTO_LOGIN_KEY, 'true')
      } else {
        localStorage.removeItem(AUTO_LOGIN_KEY)
      }
    }

    const success = await login(
      values.username,
      values.password,
      values.rememberMe,
      values.autoLogin
    )

    if (success && state.user) {
      // 登录成功，根据角色跳转
      if (state.user.role === 'admin') {
        router.push('/admin')
      } else {
        router.push('/')
      }
    }
  }

  // 如果正在检查会话，显示加载状态
  if (state.loading && !state.error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <Card className="w-[380px]">
          <CardContent className="flex items-center justify-center py-8">
            <div className="flex items-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm text-muted-foreground">检查登录状态...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex" style={{ minHeight: '100vh', display: 'flex' }}>
      {/* 左侧欢迎区域 - 参考截图的渐变背景设计 */}
      <div
        className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-purple-600 to-purple-800 relative overflow-hidden"
        style={{
          background: 'linear-gradient(to bottom right, #2563eb, #9333ea, #7c3aed)',
          position: 'relative',
          overflow: 'hidden',
          width: '50%',
          display: 'flex'
        }}
      >
        {/* 装饰性圆圈 - 参考截图风格 */}
        <div className="absolute top-20 left-20 w-32 h-32 border border-white/20 rounded-full"></div>
        <div className="absolute top-40 right-32 w-24 h-24 border border-white/20 rounded-full"></div>
        <div className="absolute bottom-32 left-32 w-40 h-40 border border-white/20 rounded-full"></div>
        <div className="absolute bottom-20 right-20 w-28 h-28 border border-white/20 rounded-full"></div>
        
        {/* 中央锁图标和文字 */}
        <div className="flex flex-col items-center justify-center w-full text-center px-12">
          {/* 锁图标背景圆圈 */}
          <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mb-8 backdrop-blur-sm">
            <Lock className="w-12 h-12 text-white" />
          </div>
          
          {/* 主标题 */}
          <h1 className="text-4xl font-bold text-white mb-4">
            欢迎使用
          </h1>
          
          {/* 副标题 */}
          <h2 className="text-xl text-white/90 mb-6">
            呈尚策划工具箱
          </h2>
          
          {/* 描述文字 */}
          <p className="text-white/80 text-lg leading-relaxed max-w-md">
            专业工具集合平台，助力团队高效协作
          </p>
        </div>
      </div>

      {/* 右侧登录表单区域 */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-8">
        <div className="w-full max-w-md space-y-6">
          {/* 移动端标题 */}
          <div className="lg:hidden text-center mb-8">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              欢迎使用
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              呈尚策划工具箱
            </p>
          </div>

          {/* 登录表单卡片 */}
          <Card className="shadow-lg border-0 bg-white dark:bg-gray-800">
            <CardHeader className="space-y-1 text-center pb-6">
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                呈尚策划员工登录
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                请联系人事获取员工账户
              </CardDescription>
            </CardHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                  {/* 错误提示 */}
                  {state.error && (
                    <Alert variant="destructive">
                      <AlertDescription>{state.error}</AlertDescription>
                    </Alert>
                  )}

                  {/* 用户名输入框 */}
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 dark:text-gray-300">用户名</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                              placeholder="请输入用户名"
                              className="pl-10 h-12 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400"
                              disabled={state.loading}
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* 密码输入框 */}
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 dark:text-gray-300">密码</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                              type={showPassword ? 'text' : 'password'}
                              placeholder="请输入密码"
                              className="pl-10 pr-10 h-12 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400"
                              disabled={state.loading}
                              {...field}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => setShowPassword(!showPassword)}
                              disabled={state.loading}
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4 text-gray-400" />
                              ) : (
                                <Eye className="h-4 w-4 text-gray-400" />
                              )}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* 记住我和自动登录选项 */}
                  <div className="space-y-3">
                    <FormField
                      control={form.control}
                      name="rememberMe"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              disabled={state.loading}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="text-sm font-normal text-gray-700 dark:text-gray-300">
                              记住我
                            </FormLabel>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              在此设备上保持登录状态
                            </p>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="autoLogin"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              disabled={state.loading}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="text-sm font-normal text-gray-700 dark:text-gray-300">
                              自动登录
                            </FormLabel>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              应用启动时自动登录
                            </p>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>

                <CardFooter className="pt-4">
                  <Button
                    type="submit"
                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-200"
                    disabled={state.loading}
                  >
                    {state.loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        登录中...
                      </>
                    ) : (
                      '登录'
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </Card>
        </div>
      </div>
    </div>
  )
}
