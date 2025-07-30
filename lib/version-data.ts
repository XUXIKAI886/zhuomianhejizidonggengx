// 版本更新数据管理

export interface VersionFeature {
  icon: 'sparkles' | 'shield' | 'zap' | 'bug' | 'file' | 'users' | 'settings' | 'globe'
  text: string
  highlight?: boolean
}

export interface VersionUpdate {
  version: string
  date: string
  type: 'major' | 'minor' | 'patch'
  title: string
  description: string
  features: VersionFeature[]
  isNew?: boolean
  downloadUrl?: string
  releaseNotes?: string
  breaking?: boolean
  security?: boolean
}

// 版本更新历史数据
export const versionHistory: VersionUpdate[] = [
  {
    version: "1.0.1",
    date: "2025-07-30",
    type: "minor",
    title: "🔔 智能版本通知系统上线",
    description: "新增完整的版本通知功能！用户现在可以通过点击铃铛图标查看详细的版本更新历史，包括功能特性、发布说明和快速操作。",
    features: [
      { icon: "sparkles", text: "全新的版本通知系统，点击铃铛查看更新历史", highlight: true },
      { icon: "users", text: "智能未读计数，自动标记已读状态", highlight: true },
      { icon: "settings", text: "版本分类展示：重大、功能、修复更新" },
      { icon: "zap", text: "展开/收起功能，查看完整特性列表" },
      { icon: "globe", text: "快速操作：标记已读、查看最新版本" },
      { icon: "file", text: "版本统计信息和服务器状态显示" },
      { icon: "shield", text: "本地存储记忆用户阅读状态" }
    ],
    isNew: true,
    downloadUrl: "https://github.com/XUXIKAI886/zhuomianhejizidonggengx/releases/tag/v1.0.1",
    releaseNotes: "这个版本专注于提升用户体验，让用户能够方便地了解每个版本的更新内容。"
  },
  {
    version: "1.0.0",
    date: "2025-07-30",
    type: "major",
    title: "🎉 企业级自动更新系统正式上线",
    description: "重大里程碑更新！成功部署了完整的企业级自动更新系统，实现零成本全球CDN加速更新服务，为用户提供无缝的版本升级体验。",
    features: [
      { icon: "zap", text: "零成本企业级更新服务器部署到Vercel", highlight: true },
      { icon: "shield", text: "RSA+SHA256数字签名安全验证机制", highlight: true },
      { icon: "globe", text: "全球CDN加速，100+边缘节点覆盖" },
      { icon: "sparkles", text: "自动版本检查和一键升级体验" },
      { icon: "file", text: "完整的版本管理和回滚机制" },
      { icon: "settings", text: "API接口完整，支持批量管理" },
      { icon: "users", text: "用户友好的更新通知界面" }
    ],
    downloadUrl: "https://github.com/XUXIKAI886/zhuomianhejizidonggengx/releases/tag/v1.0.0",
    releaseNotes: "这是一个重大的里程碑版本，标志着应用进入了企业级自动更新时代。",
    security: true
  },
  {
    version: "0.9.5",
    date: "2025-07-25",
    type: "minor",
    title: "界面优化与性能全面提升",
    description: "专注于用户体验优化，大幅提升应用性能和界面响应速度，修复多个用户反馈的问题。",
    features: [
      { icon: "sparkles", text: "工具卡片视觉效果和动画优化" },
      { icon: "zap", text: "WebView加载速度提升30%，响应更快" },
      { icon: "bug", text: "修复分类筛选偶发性失效问题" },
      { icon: "shield", text: "增强开发者工具保护，提升安全性" },
      { icon: "settings", text: "优化内存使用，减少资源占用" }
    ]
  },
  {
    version: "0.9.0",
    date: "2025-07-20",
    type: "minor",
    title: "新增专业工具与功能完善",
    description: "新增2个重要的专业工具，完善现有功能模块，为不同岗位用户提供更全面的工具支持。",
    features: [
      { icon: "sparkles", text: "新增销售数据报告生成系统", highlight: true },
      { icon: "sparkles", text: "新增智能排班管理系统", highlight: true },
      { icon: "zap", text: "优化工具启动速度，减少等待时间" },
      { icon: "file", text: "完善工具使用文档和帮助信息" },
      { icon: "users", text: "改进用户反馈收集机制" }
    ]
  },
  {
    version: "0.8.5",
    date: "2025-07-15",
    type: "patch",
    title: "稳定性修复与体验优化",
    description: "专注于修复已知问题，提升应用整体稳定性和用户体验。",
    features: [
      { icon: "bug", text: "修复WebView偶发性崩溃问题" },
      { icon: "bug", text: "修复搜索功能特殊字符处理异常" },
      { icon: "zap", text: "优化内存使用效率，减少内存泄漏" },
      { icon: "shield", text: "加强错误处理机制，提升容错性" }
    ]
  },
  {
    version: "0.8.0",
    date: "2025-07-10",
    type: "minor",
    title: "工具生态系统扩展",
    description: "大幅扩展工具生态系统，新增多个实用工具，完善分类管理。",
    features: [
      { icon: "sparkles", text: "新增美团数据处理工具套件" },
      { icon: "sparkles", text: "新增财务记账管理系统" },
      { icon: "users", text: "新增人事面试顾问系统" },
      { icon: "settings", text: "完善工具分类和标签系统" },
      { icon: "file", text: "更新工具使用指南和最佳实践" }
    ]
  },
  {
    version: "0.7.5",
    date: "2025-07-05",
    type: "patch",
    title: "安全性增强与Bug修复",
    description: "重点加强应用安全性，修复多个安全漏洞和稳定性问题。",
    features: [
      { icon: "shield", text: "加强开发者工具禁用机制" },
      { icon: "shield", text: "修复潜在的XSS安全漏洞" },
      { icon: "bug", text: "修复工具窗口关闭异常问题" },
      { icon: "zap", text: "优化应用启动速度" }
    ],
    security: true
  },
  {
    version: "0.7.0",
    date: "2025-06-30",
    type: "minor",
    title: "现代化UI设计升级",
    description: "全面升级用户界面设计，采用现代化设计语言，提升视觉体验。",
    features: [
      { icon: "sparkles", text: "全新的现代化界面设计" },
      { icon: "sparkles", text: "毛玻璃效果和流畅动画" },
      { icon: "settings", text: "响应式布局适配不同屏幕" },
      { icon: "users", text: "改进用户交互体验" },
      { icon: "file", text: "更新品牌视觉识别系统" }
    ]
  }
]

// 获取最新版本
export const getLatestVersion = (): VersionUpdate => {
  return versionHistory[0]
}

// 获取未读版本数量
export const getUnreadCount = (): number => {
  return versionHistory.filter(version => version.isNew).length
}

// 获取特定类型的版本
export const getVersionsByType = (type: 'major' | 'minor' | 'patch'): VersionUpdate[] => {
  return versionHistory.filter(version => version.type === type)
}

// 获取安全更新
export const getSecurityUpdates = (): VersionUpdate[] => {
  return versionHistory.filter(version => version.security)
}

// 版本类型样式配置
export const typeStyles = {
  major: "bg-gradient-to-r from-purple-500 to-pink-500 text-white",
  minor: "bg-gradient-to-r from-blue-500 to-cyan-500 text-white", 
  patch: "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
}

export const typeLabels = {
  major: "重大更新",
  minor: "功能更新",
  patch: "修复更新"
}

// 格式化日期
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// 获取版本更新统计
export const getVersionStats = () => {
  const total = versionHistory.length
  const major = getVersionsByType('major').length
  const minor = getVersionsByType('minor').length
  const patch = getVersionsByType('patch').length
  const security = getSecurityUpdates().length
  
  return {
    total,
    major,
    minor,
    patch,
    security
  }
}
