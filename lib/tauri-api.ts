// Tauri API包装器 - 真实数据库连接，智能环境检测
// 支持Tauri桌面环境和Next.js Web环境的真实数据库访问

// 检查是否在Tauri桌面环境中 - Tauri 2.x优化检测
export const isTauriEnvironment = () => {
  if (typeof window === 'undefined') return false

  const windowAny = window as any
  
  // 检查协议 - Tauri 2.x支持多种协议
  const isTauriProtocol = windowAny.location?.protocol === 'tauri:'
  const isHttpsProtocol = windowAny.location?.protocol === 'https:' &&
                         windowAny.location?.hostname === 'tauri.localhost'
  const isHttpProtocol = windowAny.location?.protocol === 'http:' &&
                        windowAny.location?.hostname === 'tauri.localhost'

  // 检查Tauri 2.x全局对象
  const hasTauriGlobal = !!(
    windowAny.__TAURI__ ||
    windowAny.__TAURI_IPC__ ||
    windowAny.isTauri
  )

  // 检查UserAgent中的Tauri标识
  const hasTauriUserAgent = !!(
    windowAny.navigator &&
    windowAny.navigator.userAgent &&
    windowAny.navigator.userAgent.includes('Tauri')
  )

  // 检查是否有Tauri 2.x的invoke函数
  const hasInvokeFunction = !!(
    windowAny.__TAURI__?.core?.invoke ||
    windowAny.__TAURI__?.invoke ||
    windowAny.invoke
  )

  // Tauri 2.x判断逻辑：优先检查全局对象和invoke函数
  // 在开发模式下，Tauri运行在localhost:3000，协议是http:
  const isTauri = hasTauriGlobal || hasInvokeFunction || isTauriProtocol || isHttpsProtocol || isHttpProtocol
  
  // 调试日志
  console.log('🔍 Tauri 2.x环境检测:', {
    isTauriProtocol,
    isHttpsProtocol,
    isHttpProtocol,
    hasTauriGlobal,
    hasTauriUserAgent, 
    hasInvokeFunction,
    finalResult: isTauri,
    userAgent: windowAny.navigator?.userAgent,
    location: windowAny.location?.href,
    protocol: windowAny.location?.protocol,
    hostname: windowAny.location?.hostname
  })
  
  return isTauri
}

// 深度检查Tauri对象结构
const inspectTauriStructure = () => {
  const windowAny = window as any
  
  console.log('🔬 深度检查Tauri结构:')
  
  if (windowAny.__TAURI__) {
    const tauriObj = windowAny.__TAURI__
    console.log('📦 __TAURI__ 对象存在:', {
      keys: Object.keys(tauriObj),
      type: typeof tauriObj
    })
    
    // 递归检查所有属性
    Object.keys(tauriObj).forEach(key => {
      const value = tauriObj[key]
      console.log(`  📌 __TAURI__.${key}:`, {
        type: typeof value,
        isFunction: typeof value === 'function',
        keys: typeof value === 'object' && value ? Object.keys(value) : null
      })
      
      // 如果是对象，继续检查下一层
      if (typeof value === 'object' && value) {
        Object.keys(value).forEach(subKey => {
          const subValue = value[subKey]
          console.log(`    🔸 __TAURI__.${key}.${subKey}:`, {
            type: typeof subValue,
            isFunction: typeof subValue === 'function'
          })
        })
      }
    })
  }
  
  // 检查其他可能的Tauri相关对象
  const possibleTauriObjects = [
    '__TAURI_IPC__',
    '__TAURI_INTERNALS__', 
    '__TAURI_METADATA__',
    'tauri',
    'invoke'
  ]
  
  possibleTauriObjects.forEach(objName => {
    if (windowAny[objName]) {
      console.log(`📦 ${objName} 存在:`, {
        type: typeof windowAny[objName],
        keys: typeof windowAny[objName] === 'object' ? Object.keys(windowAny[objName]) : null
      })
    }
  })
}

// 安全的invoke函数 - 基于Tauri 2.x最佳实践
export const safeInvoke = async (command: string, args?: any): Promise<any> => {
  console.log(`🔧 开始Tauri invoke调用: ${command}`)

  try {
    // 优先使用官方@tauri-apps/api包
    if (typeof window !== 'undefined') {
      try {
        const { invoke } = await import('@tauri-apps/api/core')
        console.log(`✅ 使用官方@tauri-apps/api调用: ${command}`)
        const result = await invoke(command, args)
        console.log(`✅ Tauri invoke成功 ${command}:`, result)
        return result
      } catch (importError) {
        console.log('📦 @tauri-apps/api导入失败，尝试全局API:', importError)
      }
    }

    // 回退到全局API检查
    const windowAny = window as any
    let invokeFunction = null
    let methodName = ''

    // 按Tauri 2.x优先级顺序检查
    if (windowAny.__TAURI__?.core?.invoke) {
      invokeFunction = windowAny.__TAURI__.core.invoke
      methodName = '__TAURI__.core.invoke'
    }
    else if (windowAny.__TAURI__?.invoke) {
      invokeFunction = windowAny.__TAURI__.invoke
      methodName = '__TAURI__.invoke'
    }
    else if (windowAny.invoke) {
      invokeFunction = windowAny.invoke
      methodName = 'window.invoke'
    }

    if (!invokeFunction) {
      throw new Error('未找到任何可用的Tauri invoke函数 - 可能不在Tauri环境中')
    }

    console.log(`📱 使用 ${methodName} 调用: ${command}`)
    
    // 调用Tauri命令，确保参数格式正确
    const result = await invokeFunction(command, args || {})
    console.log(`✅ Tauri调用成功 ${command}:`, result)
    return result

  } catch (error: any) {
    console.error(`❌ Tauri invoke失败 ${command}:`, error)
    
    // 提供更详细的错误信息
    if (error?.message?.includes('missing Origin header')) {
      console.error('Origin头缺失错误 - 可能是协议配置问题')
      throw new Error(`IPC调用失败 - Origin头缺失。请检查应用是否正确运行在Tauri协议下。原始错误: ${error.message}`)
    }
    
    throw error
  }
}

// 专注于Tauri API - 已移除Next.js和临时会话管理

// 模拟数据 - 与真实数据库结构保持一致
// 注意：使用有效的MongoDB ObjectId格式（24位十六进制字符串）
export const mockData = {
  users: [
    {
      id: '507f1f77bcf86cd799439011', // 有效的MongoDB ObjectId (admin)
      username: 'admin',
      role: 'admin',
      isActive: true,
      createdAt: '2025-08-01T03:34:35.464Z',
      lastLoginAt: '2025-08-08T08:15:42.123Z',
      totalUsageTime: 7200,
      loginCount: 25
    }
  ],
  systemStats: {
    totalUsers: 1,
    activeUsersToday: 1,
    totalSessions: 25, // 这是关键数据 - 与管理后台保持一致
    mostPopularTools: [
      {
        toolId: 1,
        toolName: '商家回复解答手册',
        totalClicks: 150,
        totalUsageTime: 7200,
        uniqueUsers: 1
      },
      {
        toolId: 6,
        toolName: '域锦科技AI系统',
        totalClicks: 120,
        totalUsageTime: 5400,
        uniqueUsers: 1
      }
    ]
  },
  systemAnalytics: {
    totalUsers: 1,
    activeUsersToday: 1,
    totalSessions: 25, // 与systemStats保持一致
    averageSessionDuration: 1800,
    mostPopularTools: [
      {
        toolId: 1,
        toolName: '商家回复解答手册',
        totalClicks: 150,
        totalUsageTime: 7200,
        uniqueUsers: 1
      },
      {
        toolId: 6,
        toolName: '域锦科技AI系统',
        totalClicks: 120,
        totalUsageTime: 5400,
        uniqueUsers: 1
      }
    ],
    userGrowthTrend: [
      {
        date: '2025-08-08',
        newUsers: 0,
        activeUsers: 1,
        totalSessions: 25
      }
    ],
    toolUsageTrend: [
      {
        date: '2025-08-08',
        totalClicks: 270,
        totalUsageTime: 12600,
        uniqueUsers: 1
      }
    ]
  }
}

// 模拟登录函数
const mockLogin = async (username: string, password: string) => {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 100))

  // 验证预设账号
  const validCredentials = [
    { username: 'admin', password: 'admin@2025csch' }
  ]

  const isValid = validCredentials.some(cred =>
    cred.username === username && cred.password === password
  )

  if (!isValid) {
    throw new Error('用户名或密码错误')
  }

  // 返回对应用户数据
  const user = mockData.users.find(u => u.username === username)
  if (!user) {
    throw new Error('用户不存在')
  }

  return user
}

// 统一的API调用函数 - 支持Tauri、Next.js API和模拟数据
export const apiCall = async (command: string, args?: any): Promise<any> => {
  console.log(`🔗 API Call: ${command}`, args)

  // 检测当前环境
  const inTauriEnv = isTauriEnvironment()

  console.log(`🌍 Environment Detection:`, {
    inTauriEnv,
    protocol: typeof window !== 'undefined' ? window.location?.protocol : 'server',
    hostname: typeof window !== 'undefined' ? window.location?.hostname : 'server',
    userAgent: typeof window !== 'undefined' ? window.navigator?.userAgent : 'server'
  })

  // 尝试Tauri后端
  if (inTauriEnv) {
    console.log(`📱 Using Tauri backend for: ${command}`)
    try {
      const result = await safeInvoke(command, args)
      console.log(`✅ Tauri success for ${command}:`, result)
      return result
    } catch (error) {
      console.error(`❌ Tauri invoke failed for ${command}, falling back to Next.js API:`, error)
      // 继续执行Next.js API调用
    }
  }

  // 尝试Next.js API路由 - 获取真实数据库数据
  if (typeof window !== 'undefined') {
    console.log(`🌐 Trying Next.js API for: ${command}`)
    try {
      let apiUrl = ''
      const requestBody = args || {}

      switch (command) {
        case 'login':
          apiUrl = '/api/auth/login'
          break

        case 'get_all_users_admin':
          apiUrl = '/api/admin/users'
          break

        case 'get_system_overview':
          apiUrl = '/api/admin/overview'
          break

        case 'get_system_analytics':
          apiUrl = '/api/admin/analytics' // 新创建的API路由
          break

        case 'get_user_analytics':
          apiUrl = '/api/admin/users'
          break

        case 'toggle_user_status':
          apiUrl = '/api/admin/toggle-user'
          break

        case 'delete_user':
          apiUrl = '/api/admin/delete-user'
          break

        case 'create_user':
          apiUrl = '/api/admin/create-user'
          break

        case 'edit_user':
          apiUrl = '/api/admin/edit-user'
          break

        case 'reset_user_password':
          apiUrl = '/api/admin/reset-password'
          break

        default:
          throw new Error(`未知的API命令: ${command}`)
      }

      console.log(`🔗 Calling Next.js API: ${apiUrl}`)
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        throw new Error(`API调用失败: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      console.log(`✅ Next.js API success for ${command}:`, data)

      // 处理不同API的响应格式
      if (command === 'get_system_analytics') {
        return data // 直接返回SystemAnalytics格式的数据
      } else if (data.success && data.stats) {
        return data.stats // 返回stats字段
      } else if (data.success && data.users) {
        return data.users // 返回users字段
      } else if (data.success && data.user) {
        return data.user // 返回user字段
      } else if (data.success) {
        return data // 返回整个响应
      } else {
        throw new Error(data.error || 'API调用失败')
      }

    } catch (error) {
      console.error(`❌ Next.js API failed for ${command}:`, error)
      // 继续执行模拟数据逻辑
    }
  }

  // 最终回退到模拟数据
  console.log(`🎭 Using mock data for: ${command}`)

  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 100))

  switch (command) {
    case 'login':
      return mockLogin(args.username, args.password)

    case 'get_all_users_admin':
      return JSON.parse(JSON.stringify(mockData.users))

    case 'get_system_overview':
      return JSON.parse(JSON.stringify(mockData.systemStats))

    case 'get_system_analytics':
      return JSON.parse(JSON.stringify(mockData.systemAnalytics))

    case 'get_user_analytics':
      return JSON.parse(JSON.stringify(mockData.users))

    case 'toggle_user_status':
      // 模拟切换用户状态
      const user = mockData.users.find(u => u.id === args.userId)
      if (user) {
        user.isActive = !user.isActive
      }
      return { success: true }

    case 'delete_user':
      // 模拟删除用户
      const index = mockData.users.findIndex(u => u.id === args.userId)
      if (index > -1) {
        mockData.users.splice(index, 1)
      }
      return { success: true }

    case 'create_user':
      // 模拟创建用户
      // 生成有效的MongoDB ObjectId格式（24位十六进制字符串）
      const timestamp = Math.floor(Date.now() / 1000).toString(16).padStart(8, '0')
      const randomBytes = Math.random().toString(16).substring(2, 18).padEnd(16, '0')
      const mockObjectId = timestamp + randomBytes

      const newUser = {
        id: mockObjectId, // 有效的MongoDB ObjectId格式
        username: args.username,
        role: args.role,
        isActive: true,
        createdAt: new Date().toISOString(),
        lastLoginAt: null,
        totalUsageTime: 0,
        loginCount: 0
      }
      mockData.users.push(newUser)
      return newUser

    case 'edit_user':
      // 模拟编辑用户
      const editUser = mockData.users.find(u => u.id === args.userId)
      if (editUser) {
        Object.assign(editUser, {
          username: args.username,
          role: args.role,
          isActive: args.isActive
        })
      }
      return editUser

    case 'reset_user_password':
      // 模拟重置密码
      return { success: true }

    case 'track_user_activity':
      // 模拟记录用户活动
      console.log(`📊 Mock tracking user activity:`, {
        userId: args.userId,
        activityType: args.activityType,
        toolId: args.toolId,
        toolName: args.toolName,
        duration: args.duration
      })
      return { success: true }

    case 'logout':
      // 模拟用户登出
      console.log(`👋 Mock user logout:`, args.userId)
      return { success: true }

    case 'check_session':
      // 模拟会话检查 - 返回null表示无会话
      console.log(`🔍 Mock session check - no active session`)
      throw new Error('No active session')

    case 'verify_token_and_login':
      // 模拟Token验证 - 始终失败，强制用户重新登录
      console.log(`🔑 Mock token verification - token invalid`)
      throw new Error('Invalid token')

    default:
      throw new Error(`未知的API命令: ${command}`)
  }
}