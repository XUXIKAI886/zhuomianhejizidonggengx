'use client'

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react'
import { toast } from 'sonner'
import { apiCall } from '@/lib/tauri-api'

// 用户类型定义
export interface User {
  id: string
  username: string
  role: 'admin' | 'user'
  isActive: boolean
  createdAt: string
  lastLoginAt?: string
  totalUsageTime: number
}

// 认证状态类型
interface AuthState {
  user: User | null
  isAuthenticated: boolean
  loading: boolean
  error: string | null
}

// 认证动作类型
type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: User }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'CLEAR_ERROR' }
  | { type: 'CHECK_SESSION_SUCCESS'; payload: User }
  | { type: 'CHECK_SESSION_FAILURE' }

// 认证上下文类型
interface AuthContextType {
  state: AuthState
  login: (username: string, password: string, rememberMe?: boolean, autoLogin?: boolean) => Promise<boolean>
  logout: () => Promise<void>
  checkSession: () => Promise<void>
  clearError: () => void
}

// 初始状态
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: true, // 初始加载状态为true，用于检查会话
  error: null,
}

// Reducer函数
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        loading: true,
        error: null,
      }
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        loading: false,
        error: null,
      }
    case 'LOGIN_FAILURE':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload,
      }
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      }
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      }
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      }
    case 'CHECK_SESSION_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        loading: false,
        error: null,
      }
    case 'CHECK_SESSION_FAILURE':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      }
    default:
      return state
  }
}

// 创建上下文
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// AuthProvider组件
export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // 登录函数
  const login = async (
    username: string,
    password: string,
    rememberMe: boolean = false,
    autoLogin: boolean = false
  ): Promise<boolean> => {
    dispatch({ type: 'LOGIN_START' })

    try {
      const user = await apiCall('login', {
        username,
        password,
        rememberMe,
        autoLogin,
      })

      dispatch({ type: 'LOGIN_SUCCESS', payload: user })

      // 记录登录成功日志
      try {
        await apiCall('track_user_activity', {
          userId: user.id,
          activityType: 'login',
          toolId: null,
          duration: null,
        })
      } catch (trackError) {
        console.log('记录登录日志失败:', trackError)
      }

      toast.success(`欢迎回来，${user.username}！`)
      return true
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      dispatch({ type: 'LOGIN_FAILURE', payload: errorMessage })
      toast.error(errorMessage || '登录失败，请检查用户名和密码')
      return false
    }
  }

  // 登出函数
  const logout = async (): Promise<void> => {
    try {
      if (state.user) {
        try {
          await apiCall('logout', { userId: state.user.id })

          // 记录登出日志
          await apiCall('track_user_activity', {
            userId: state.user.id,
            activityType: 'logout',
            toolId: null,
            duration: null,
          })
        } catch (apiError) {
          console.log('后端登出失败:', apiError)
        }
      }

      dispatch({ type: 'LOGOUT' })
      toast.success('已安全退出登录')
    } catch (error) {
      console.error('登出失败:', error)
      // 即使后端登出失败，也要清除前端状态
      dispatch({ type: 'LOGOUT' })
      toast.error('登出时发生错误，但已清除本地会话')
    }
  }

  // 检查会话函数
  const checkSession = async (): Promise<void> => {
    try {
      const user = await apiCall('check_session')
      dispatch({ type: 'CHECK_SESSION_SUCCESS', payload: user })
    } catch (error) {
      // 在Web环境下，会话检查通常会失败，这是正常行为
      // 因为Next.js API路由是无状态的
      console.log('会话检查失败，用户需要重新登录:', error)
      dispatch({ type: 'CHECK_SESSION_FAILURE' })
    }
  }

  // 清除错误函数
  const clearError = (): void => {
    dispatch({ type: 'CLEAR_ERROR' })
  }

  // 应用启动时检查会话
  useEffect(() => {
    checkSession()
  }, [])

  const contextValue: AuthContextType = {
    state,
    login,
    logout,
    checkSession,
    clearError,
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

// 自定义Hook
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// 路由保护Hook
export function useRequireAuth(requiredRole?: 'admin' | 'user') {
  const { state } = useAuth()
  
  useEffect(() => {
    if (!state.loading && !state.isAuthenticated) {
      // 重定向到登录页
      window.location.href = '/login'
      return
    }

    if (requiredRole && state.user && state.user.role !== requiredRole) {
      // 权限不足
      toast.error('权限不足，无法访问此页面')
      window.location.href = '/'
      return
    }
  }, [state.loading, state.isAuthenticated, state.user, requiredRole])

  return {
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    loading: state.loading,
  }
}
