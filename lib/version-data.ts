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
    version: "1.0.23",
    date: "2025-08-07",
    type: "minor",
    title: "🖼️ 新增第21个工具 - 图片墙图片分割工具",
    description: "新增专业的图片墙分割工具，支持一键上传图片墙并自动分割为三个相等部分，提供多种格式下载。进一步扩展运营工具生态，为运营团队提供更丰富的图片处理能力。",
    features: [
      { icon: "sparkles", text: "新增图片墙图片分割工具", highlight: true },
      { icon: "zap", text: "一键上传自动分割为三等分" },
      { icon: "settings", text: "支持多种格式下载" },
      { icon: "file", text: "运营素材批量处理" },
      { icon: "globe", text: "运营工具总数扩展至12个" }
    ],
    isNew: false,
    downloadUrl: "https://github.com/XUXIKAI886/zhuomianhejizidonggengx/releases/tag/v1.0.23"
  },
  {
    version: "1.0.22",
    date: "2025-08-06",
    type: "minor",
    title: "🎯 新增第20个工具 - 外卖数周报系统（升级版）",
    description: "新增专业的外卖数周报系统，支持输入店铺数据自动生成专业运营分析报告。进一步完善运营工具生态，为运营团队提供更强大的数据分析能力。",
    features: [
      { icon: "sparkles", text: "新增外卖数周报系统（升级版）", highlight: true },
      { icon: "zap", text: "自动生成专业运营分析报告" },
      { icon: "file", text: "支持店铺数据输入和处理" },
      { icon: "settings", text: "运营工具总数扩展至20个" },
      { icon: "globe", text: "完善的工具生态系统" }
    ],
    isNew: false,
    downloadUrl: "https://github.com/XUXIKAI886/zhuomianhejizidonggengx/releases/tag/v1.0.22"
  },
  {
    version: "1.0.21",
    date: "2025-08-02",
    type: "patch",
    title: "🔧 天气API最终修复版本 - HTTP权限配置完善",
    description: "最终解决天气组件网络请求问题。通过正确配置Tauri HTTP权限和作用域，确保天气功能在开发和生产环境下都能正常工作。",
    features: [
      { icon: "shield", text: "完善Tauri HTTP权限配置", highlight: true },
      { icon: "zap", text: "修复JSON配置语法错误" },
      { icon: "settings", text: "独立HTTP capability配置文件" },
      { icon: "globe", text: "正确的URL作用域权限设置" },
      { icon: "sparkles", text: "开发和生产环境完全兼容" },
      { icon: "users", text: "天气组件功能完全正常" }
    ],
    isNew: false,
    downloadUrl: "https://github.com/XUXIKAI886/zhuomianhejizidonggengx/releases/tag/v1.0.21"
  },
  {
    version: "1.0.20",
    date: "2025-08-02",
    type: "patch",
    title: "🔧 天气API修复版本 - 生产环境网络问题解决",
    description: "紧急修复V1.0.19生产环境中天气组件网络请求失败的问题。通过添加Tauri HTTP插件和配置URL作用域，确保天气功能在所有环境下正常工作。",
    features: [
      { icon: "shield", text: "修复生产环境天气API调用失败问题", highlight: true },
      { icon: "zap", text: "添加Tauri HTTP插件支持" },
      { icon: "settings", text: "配置高德API URL作用域权限" },
      { icon: "globe", text: "双环境HTTP客户端自动切换" },
      { icon: "sparkles", text: "完善错误处理和日志记录" },
      { icon: "users", text: "保持开发环境JSONP兼容性" }
    ],
    isNew: false,
    downloadUrl: "https://github.com/XUXIKAI886/zhuomianhejizidonggengx/releases/tag/v1.0.20"
  },
  {
    version: "1.0.19",
    date: "2025-08-02",
    type: "minor",
    title: "🌤️ 宜昌天气预览 - 企业级界面优化版本",
    description: "全新宜昌天气预览功能替换快速操作，提供实时天气信息。同时优化工具卡片悬停效果，采用企业级专业设计标准，提升整体用户体验和界面美观度。",
    features: [
      { icon: "sparkles", text: "宜昌天气预览组件 - 实时天气信息", highlight: true },
      { icon: "zap", text: "企业级工具卡片悬停效果优化" },
      { icon: "settings", text: "天气API跨域问题修复 - JSONP方案" },
      { icon: "globe", text: "天气组件布局优化 - 专业排版设计" },
      { icon: "shield", text: "高德地图API集成 - 权威数据源" },
      { icon: "users", text: "自动更新机制 - 每小时刷新" }
    ],
    isNew: false,
    downloadUrl: "https://github.com/XUXIKAI886/zhuomianhejizidonggengx/releases/tag/v1.0.19"
  },
  {
    version: "1.0.18",
    date: "2025-08-01",
    type: "minor",
    title: "🔐 企业级Token认证系统 - 记住我与自动登录",
    description: "全新实现企业级Token认证系统，支持记住我和自动登录功能。采用JWT Token + MongoDB存储，提供30天记住我和7天自动登录，大幅提升用户体验的同时保持企业级安全标准。",
    features: [
      { icon: "shield", text: "JWT Token安全认证系统", highlight: true },
      { icon: "zap", text: "记住我功能 - 30天免登录体验" },
      { icon: "sparkles", text: "自动登录功能 - 应用启动即登录" },
      { icon: "settings", text: "智能会话恢复机制" },
      { icon: "users", text: "跨设备Token同步管理" },
      { icon: "globe", text: "登录页面品牌化升级" }
    ],
    isNew: false,
    downloadUrl: "https://github.com/XUXIKAI886/zhuomianhejizidonggengx/releases/tag/v1.0.18",
    security: true
  },
  {
    version: "1.0.17",
    date: "2025-08-01",
    type: "minor",
    title: "🔍 企业级MongoDB管理系统 - 详细日志监控版本",
    description: "实现企业级MongoDB管理系统，新增用户管理详细日志记录功能。提供完整的用户操作追踪、权限监控和数据变化记录，大幅提升系统可维护性和安全审计能力。",
    features: [
      { icon: "sparkles", text: "企业级MongoDB数据分析仪表板", highlight: true },
      { icon: "shield", text: "详细用户管理操作日志记录", highlight: true },
      { icon: "users", text: "完整的用户CRUD操作权限管理" },
      { icon: "zap", text: "实时数据可视化和统计分析" },
      { icon: "settings", text: "MongoDB聚合管道高级查询" },
      { icon: "bug", text: "修复参数命名和序列化问题" },
      { icon: "file", text: "完善的技术文档和操作手册" },
      { icon: "globe", text: "优化系统性能和用户体验" }
    ],
    isNew: false,
    downloadUrl: "https://github.com/XUXIKAI886/zhuomianhejizidonggengx/releases/tag/v1.0.17",
    releaseNotes: "MongoDB管理系统与详细日志监控功能发布",
    breaking: false,
    security: true
  },
  {
    version: "1.0.16",
    date: "2025-07-31",
    type: "minor",
    title: "📚 技术文档完善版本 - 深度技术债务预防体系",
    description: "建立完整的技术文档体系和版本管理最佳实践。新增React异步状态管理技术问题防范清单，修复版本检测异常，创建企业级技术债务预防框架。",
    features: [
      { icon: "sparkles", text: "新增57页完整技术修复指南文档", highlight: true },
      { icon: "shield", text: "修复React异步状态竞态条件，确保版本检测准确性", highlight: true },
      { icon: "file", text: "创建技术问题防范清单，建立代码审查标准" },
      { icon: "settings", text: "完善版本发布流程，从4步扩展到6步标准化流程" },
      { icon: "zap", text: "更新README文档，新增深度技术问题解决方案" },
      { icon: "users", text: "建立可复用的技术债务预防框架" }
    ],
    isNew: true,
    downloadUrl: "https://github.com/XUXIKAI886/zhuomianhejizidonggengx/releases/tag/v1.0.16",
    releaseNotes: "这是一个重要的技术完善版本，建立了完整的技术文档和预防体系，为项目长期稳定发展奠定基础。"
  },
  {
    version: "1.0.15",
    date: "2025-07-31",
    type: "minor",
    title: "🎯 更新弹窗优化版本",
    description: "优化更新检查用户体验，移除多余的调试弹窗，只保留关键的更新提示。简化更新流程，提供更清晰的版本管理和更新通知。",
    features: [
      { icon: "sparkles", text: "移除多余的调试弹窗提示", highlight: true },
      { icon: "zap", text: "优化更新检查用户体验" },
      { icon: "settings", text: "简化更新流程和版本管理" }
    ],
    isNew: false,
    downloadUrl: "https://github.com/XUXIKAI886/zhuomianhejizidonggengx/releases/tag/v1.0.15"
  },
  {
    version: "1.0.11",
    date: "2025-07-31",
    type: "patch",
    title: "🔧 自动更新系统IPC通信修复版本",
    description: "修复自动更新系统IPC通信问题，完善Tauri插件配置，优化开发环境下的更新检查功能。添加app插件支持，解决版本获取和更新检查API调用失败问题。",
    features: [
      { icon: "zap", text: "修复IPC通信错误，解决missing Origin header问题", highlight: true },
      { icon: "settings", text: "添加tauri-plugin-app插件，完善API支持" },
      { icon: "shield", text: "优化开发环境CSP配置，提升调试体验" },
      { icon: "sparkles", text: "完善HTTP fallback机制，确保更新功能稳定" }
    ],
    isNew: true,
    downloadUrl: "https://github.com/XUXIKAI886/zhuomianhejizidonggengx/releases/tag/v1.0.11",
    releaseNotes: "这个版本主要修复了开发环境下的IPC通信问题，完善了Tauri插件配置，确保自动更新系统在各种环境下都能正常工作。"
  },
  {
    version: "1.0.10",
    date: "2025-07-31",
    type: "minor",
    title: "🎯 用户体验优化版本 - 可视化更新提示",
    description: "全面优化自动更新用户体验，添加启动时可视化更新检查提示，让用户清楚了解更新状态。修复UpdateChecker组件位置问题，确保自动更新功能完美运行。",
    features: [
      { icon: "sparkles", text: "新增启动时可视化更新检查提示", highlight: true },
      { icon: "zap", text: "修复UpdateChecker组件位置，确保自动更新正常工作" },
      { icon: "users", text: "优化用户反馈，明确显示更新检查结果" },
      { icon: "settings", text: "完善Toast通知系统，提升交互体验" }
    ],
    isNew: true,
    downloadUrl: "https://github.com/XUXIKAI886/zhuomianhejizidonggengx/releases/tag/v1.0.10",
    releaseNotes: "这个版本主要优化了自动更新的用户体验，用户启动应用时会看到明确的更新检查提示，不再是静默检查。"
  },
  {
    version: "1.0.9",
    date: "2025-07-31",
    type: "patch",
    title: "🔧 自动更新系统修复版本",
    description: "修复自动更新系统版本数据同步问题，确保更新功能正常工作。优化更新检查机制和错误处理，提升系统稳定性。",
    features: [
      { icon: "zap", text: "修复版本数据同步问题，确保更新检查正常", highlight: true },
      { icon: "shield", text: "优化更新检查机制和错误处理逻辑" },
      { icon: "settings", text: "完善版本管理和发布流程" },
      { icon: "users", text: "提升系统稳定性和用户体验" }
    ],
    isNew: false,
    downloadUrl: "https://github.com/XUXIKAI886/zhuomianhejizidonggengx/releases/tag/v1.0.9",
    releaseNotes: "这个版本主要修复了自动更新系统的版本数据同步问题，确保用户能够正常接收更新通知。"
  },
  {
    version: "1.0.8",
    date: "2025-07-30",
    type: "patch",
    title: "🔧 强化调试版本 - 强制启用开发者工具",
    description: "强化调试版本，强制启用开发者工具和日志功能，禁用Web安全限制，确保调试功能在Release模式下也能正常工作。",
    features: [
      { icon: "settings", text: "强制启用开发者工具，不受构建模式限制", highlight: true },
      { icon: "shield", text: "禁用Web安全限制，确保调试功能正常" },
      { icon: "zap", text: "强制启用日志插件，提供详细调试信息" },
      { icon: "users", text: "专门用于排查更新问题的强化调试版本" }
    ],
    downloadUrl: "https://github.com/XUXIKAI886/zhuomianhejizidonggengx/releases/tag/v1.0.8",
    releaseNotes: "这是一个强化调试版本，确保开发者工具在所有情况下都能正常工作。"
  },
  {
    version: "1.0.7",
    date: "2025-07-30",
    type: "patch",
    title: "🔧 调试版本 - 启用开发者工具",
    description: "临时启用开发者工具，便于排查自动更新问题。包含完整的日志输出和调试功能。",
    features: [
      { icon: "settings", text: "启用开发者工具，支持F12打开控制台", highlight: true },
      { icon: "zap", text: "增强调试日志输出，便于问题排查" },
      { icon: "shield", text: "保持所有更新功能和环境检测逻辑" },
      { icon: "users", text: "临时调试版本，用于问题诊断" }
    ],
    downloadUrl: "https://github.com/XUXIKAI886/zhuomianhejizidonggengx/releases/tag/v1.0.7",
    releaseNotes: "这是一个临时调试版本，启用了开发者工具以便排查更新问题。"
  },
  {
    version: "1.0.6",
    date: "2025-07-30",
    type: "minor",
    title: "🌐 更新服务器域名优化",
    description: "将更新服务器迁移到自定义域名 www.yujinkeji.asia，提升国内用户访问稳定性，同时简化环境检测逻辑。",
    features: [
      { icon: "globe", text: "更新服务器迁移到自定义域名 www.yujinkeji.asia", highlight: true },
      { icon: "zap", text: "提升国内用户访问稳定性和速度" },
      { icon: "settings", text: "简化Tauri环境检测逻辑，提高兼容性" },
      { icon: "shield", text: "优化更新检查机制，减少误报" }
    ],
    downloadUrl: "https://github.com/XUXIKAI886/zhuomianhejizidonggengx/releases/tag/v1.0.6",
    releaseNotes: "这个版本主要优化了更新服务器的访问体验，特别是国内用户。"
  },
  {
    version: "1.0.5",
    date: "2025-07-30",
    type: "patch",
    title: "🛠️ 更新检测机制优化",
    description: "彻底修复桌面应用中的自动更新检测问题，优化Tauri环境检测逻辑，确保在所有桌面环境中都能正常工作。",
    features: [
      { icon: "zap", text: "优化Tauri环境检测逻辑，支持多种检测方式", highlight: true },
      { icon: "shield", text: "跳过环境检测失败，直接尝试更新API调用" },
      { icon: "settings", text: "增强错误处理和详细的诊断日志" },
      { icon: "users", text: "改进用户体验，提供更准确的状态反馈" }
    ],
    downloadUrl: "https://github.com/XUXIKAI886/zhuomianhejizidonggengx/releases/tag/v1.0.5",
    releaseNotes: "这个版本彻底解决了自动更新功能的环境检测问题。"
  },
  {
    version: "1.0.4",
    date: "2025-07-30",
    type: "patch",
    title: "🔧 自动更新功能修复",
    description: "修复桌面应用中自动更新功能的Tauri环境检测问题，增加详细的诊断信息，确保更新功能正常工作。",
    features: [
      { icon: "shield", text: "修复Tauri环境检测失败问题", highlight: true },
      { icon: "zap", text: "增加详细的更新检查诊断日志" },
      { icon: "settings", text: "优化更新权限配置和错误处理" },
      { icon: "users", text: "改进用户反馈信息，提供更清晰的错误提示" }
    ],
    downloadUrl: "https://github.com/XUXIKAI886/zhuomianhejizidonggengx/releases/tag/v1.0.4",
    releaseNotes: "这是一个重要的修复版本，解决了自动更新功能的技术问题。"
  },
  {
    version: "1.0.3",
    date: "2025-07-30",
    type: "patch",
    title: "🏷️ 产品名称标准化",
    description: "将产品名称从 'ccsh' 标准化为 'csch'（呈尚策划），提供更清晰的品牌标识和更好的用户识别度。",
    features: [
      { icon: "sparkles", text: "产品名称标准化为 'csch'（呈尚策划）", highlight: true },
      { icon: "settings", text: "安装包文件名更新为 'csch_x.x.x_x64-setup.exe'" },
      { icon: "shield", text: "保持英文文件名，确保GitHub兼容性" },
      { icon: "users", text: "提升品牌识别度和用户体验" }
    ],
    downloadUrl: "https://github.com/XUXIKAI886/zhuomianhejizidonggengx/releases/tag/v1.0.3",
    releaseNotes: "这个版本主要是产品名称的标准化更新，提升品牌一致性。"
  },
  {
    version: "1.0.2",
    date: "2025-07-30",
    type: "patch",
    title: "🔧 安装包文件名优化",
    description: "修复GitHub Release中文文件名被过滤的问题，将安装包名称改为英文，确保上传和下载的稳定性。",
    features: [
      { icon: "settings", text: "安装包文件名改为英文 'ccsh'，避免中文字符问题", highlight: true },
      { icon: "shield", text: "修复GitHub Release文件名被过滤的问题" },
      { icon: "zap", text: "提升安装包下载的稳定性和兼容性" },
      { icon: "file", text: "优化自动更新系统的文件识别机制" }
    ],
    downloadUrl: "https://github.com/XUXIKAI886/zhuomianhejizidonggengx/releases/tag/v1.0.2",
    releaseNotes: "这是一个重要的修复版本，解决了安装包文件名的兼容性问题。"
  },
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
