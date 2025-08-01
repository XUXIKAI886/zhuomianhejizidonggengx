// Tauri API包装器 - 纯真实数据库连接
// 移除所有模拟数据，只使用真实的Tauri后端或Next.js API

// 检查是否在Tauri环境中
export const isTauriEnvironment = () => {
  if (typeof window === 'undefined') return false

  // 检查多种可能的Tauri API位置
  const windowAny = window as any
  return !!(
    windowAny.__TAURI__ ||
    windowAny.__TAURI_IPC__ ||
    windowAny.isTauri ||
    (windowAny.navigator && windowAny.navigator.userAgent && windowAny.navigator.userAgent.includes('Tauri'))
  )
}

// 安全的invoke函数
export const safeInvoke = async (command: string, args?: any): Promise<any> => {
  if (!isTauriEnvironment()) {
    throw new Error('Not in Tauri environment')
  }

  try {
    // 尝试多种方式访问Tauri API
    const windowAny = window as any

    // 方法1: 使用__TAURI__对象
    if (windowAny.__TAURI__ && windowAny.__TAURI__.tauri && windowAny.__TAURI__.tauri.invoke) {
      return await windowAny.__TAURI__.tauri.invoke(command, args)
    }

    // 方法2: 使用__TAURI_IPC__
    if (windowAny.__TAURI_IPC__ && windowAny.__TAURI_IPC__.invoke) {
      return await windowAny.__TAURI_IPC__.invoke(command, args)
    }

    // 方法3: 直接使用invoke
    if (windowAny.invoke) {
      return await windowAny.invoke(command, args)
    }

    throw new Error('Tauri invoke not available')
  } catch (error) {
    console.error(`Tauri invoke error for command ${command}:`, error)
    throw error
  }
}

// Next.js API路由调用
export const callNextjsAPI = async (endpoint: string, data?: any): Promise<any> => {
  try {
    const response = await fetch(`/api/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: response.statusText }))
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error(`Next.js API error for endpoint ${endpoint}:`, error)
    throw error
  }
}

// 统一的API调用函数 - 只使用真实数据源
export const apiCall = async (command: string, args?: any): Promise<any> => {
  console.log(`🔗 API Call: ${command}`, args)

  // 优先尝试Tauri环境（桌面应用）
  if (isTauriEnvironment()) {
    try {
      console.log(`📱 Using Tauri backend for: ${command}`)
      const result = await safeInvoke(command, args)
      console.log(`✅ Tauri success for ${command}:`, result)
      return result
    } catch (error) {
      console.error(`❌ Tauri failed for ${command}:`, error)
      // 不回退到模拟数据，直接抛出错误
      throw new Error(`Tauri API调用失败: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  // 尝试Next.js API路由（Web环境）
  try {
    console.log(`🌐 Using Next.js API for: ${command}`)
    
    // 映射命令到API端点
    const endpointMap: Record<string, string> = {
      'login': 'auth/login',
      'logout': 'auth/logout',
      'check_session': 'auth/session',
      'get_all_users_admin': 'admin/users',
      'get_system_overview': 'admin/overview',
      'track_user_activity': 'auth/activity',
      'toggle_user_status': 'admin/toggle-user',
      'delete_user': 'admin/delete-user',
      'create_user': 'admin/create-user',
      'edit_user': 'admin/edit-user',
      'reset_user_password': 'admin/reset-password',
      'get_admin_logs': 'admin/logs'
    }

    const endpoint = endpointMap[command]
    if (!endpoint) {
      throw new Error(`未知的API命令: ${command}`)
    }

    const result = await callNextjsAPI(endpoint, args)
    console.log(`✅ Next.js API success for ${command}:`, result)
    
    // 处理Next.js API的响应格式
    if (command === 'login' && result.user) {
      return result.user
    } else if (command === 'get_all_users_admin' && result.users) {
      return result.users
    } else if (command === 'get_system_overview' && result.stats) {
      return result.stats
    } else if (result.success) {
      return result
    }
    
    return result
  } catch (error) {
    console.error(`❌ Next.js API failed for ${command}:`, error)
    throw new Error(`API调用失败: ${error instanceof Error ? error.message : String(error)}`)
  }
}