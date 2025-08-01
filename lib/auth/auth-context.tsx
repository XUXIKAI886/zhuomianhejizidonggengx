'use client'

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react'
import { toast } from 'sonner'
import { apiCall } from '@/lib/tauri-api'

// Token存储键名
const REMEMBER_ME_TOKEN_KEY = 'chengshang_remember_me_token'
const AUTO_LOGIN_TOKEN_KEY = 'chengshang_auto_login_token'

// Token管理辅助函数
const saveToken = (key: string, token: string) => {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, token)
    }
  } catch (error) {
    console.error('保存Token失败:', error)
  }
}

const getToken = (key: string): string | null => {
  try {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(key)
    }
  } catch (error) {
    console.error('获取Token失败:', error)
  }
  return null
}

const removeToken = (key: string) => {
  try {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(key)
    }
  } catch (error) {
    console.error('删除Token失败:', error)
  }
}

const clearAllTokens = () => {
  removeToken(REMEMBER_ME_TOKEN_KEY)
  removeToken(AUTO_LOGIN_TOKEN_KEY)
}

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
      const loginResponse = await apiCall('login', {
        username,
        password,
        rememberMe,
        autoLogin,
      })

      // 提取用户信息
      const user = loginResponse.user || loginResponse

      dispatch({ type: 'LOGIN_SUCCESS', payload: user })

      // 保存Token到本地存储
      if (rememberMe && loginResponse.rememberMeToken) {
        saveToken(REMEMBER_ME_TOKEN_KEY, loginResponse.rememberMeToken)
        console.log('✅ 记住我Token已保存')
      }

      if (autoLogin && loginResponse.autoLoginToken) {
        saveToken(AUTO_LOGIN_TOKEN_KEY, loginResponse.autoLoginToken)
        console.log('✅ 自动登录Token已保存')
      }

      // 记录登录成功日志
      try {
        await apiCall('track_user_activity', {
          userId: user.id,
          activityType: 'login',
          toolId: null,
          toolName: null,
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
            toolName: null,
            duration: null,
          })
        } catch (apiError) {
          console.log('后端登出失败:', apiError)
        }
      }

      // 清除本地存储的Token
      clearAllTokens()
      console.log('✅ 本地Token已清除')

      dispatch({ type: 'LOGOUT' })
      toast.success('已安全退出登录')
    } catch (error) {
      console.error('登出失败:', error)
      // 即使后端登出失败，也要清除前端状态和Token
      clearAllTokens()
      dispatch({ type: 'LOGOUT' })
      toast.error('登出时发生错误，但已清除本地会话')
    }
  }

  // 检查会话函数
  const checkSession = async (): Promise<void> => {
    try {
      // 首先尝试检查当前会话
      const user = await apiCall('check_session')
      dispatch({ type: 'CHECK_SESSION_SUCCESS', payload: user })
      return
    } catch (error) {
      console.log('当前会话无效，尝试Token自动登录:', error)
    }

    // 尝试使用自动登录Token
    const autoLoginToken = getToken(AUTO_LOGIN_TOKEN_KEY)
    if (autoLoginToken) {
      try {
        console.log('🔄 尝试自动登录Token验证...')
        const user = await apiCall('verify_token_and_login', {
          token: autoLoginToken,
          tokenType: 'auto_login'
        })
        dispatch({ type: 'CHECK_SESSION_SUCCESS', payload: user })
        console.log('✅ 自动登录成功')
        return
      } catch (tokenError) {
        console.log('自动登录Token无效:', tokenError)
        removeToken(AUTO_LOGIN_TOKEN_KEY)
      }
    }

    // 尝试使用记住我Token
    const rememberMeToken = getToken(REMEMBER_ME_TOKEN_KEY)
    if (rememberMeToken) {
      try {
        console.log('🔄 尝试记住我Token验证...')
        const user = await apiCall('verify_token_and_login', {
          token: rememberMeToken,
          tokenType: 'remember_me'
        })
        dispatch({ type: 'CHECK_SESSION_SUCCESS', payload: user })
        console.log('✅ 记住我登录成功')
        return
      } catch (tokenError) {
        console.log('记住我Token无效:', tokenError)
        removeToken(REMEMBER_ME_TOKEN_KEY)
      }
    }

    // 所有验证都失败，用户需要重新登录
    console.log('所有会话验证失败，用户需要重新登录')
    dispatch({ type: 'CHECK_SESSION_FAILURE' })
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
