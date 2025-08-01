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
  
  // Tauri 2.x判断逻辑
  const isTauri = hasTauriGlobal || isTauriProtocol || isHttpsProtocol || isHttpProtocol
  
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

// 统一的API调用函数 - 专注Tauri API
export const apiCall = async (command: string, args?: any): Promise<any> => {
  console.log(`🔗 API Call: ${command}`, args)

  // 检测当前环境
  const inTauriEnv = isTauriEnvironment()
  
  console.log(`🌍 Environment Detection:`, { 
    inTauriEnv, 
    protocol: typeof window !== 'undefined' ? window.location?.protocol : 'server',
    hostname: typeof window !== 'undefined' ? window.location?.hostname : 'server'
  })

  // 只使用Tauri后端
  if (inTauriEnv) {
    console.log(`📱 Using Tauri backend for: ${command}`)
    const result = await safeInvoke(command, args)
    console.log(`✅ Tauri success for ${command}:`, result)
    return result
  } else {
    throw new Error(`不在Tauri环境中，无法调用命令: ${command}`)
  }
}