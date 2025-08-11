# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目架构概述

这是一个基于Tauri 2.x + Next.js 15的桌面应用"呈尚策划工具中心"，集成22个专业工具，包含完整的用户认证系统和MongoDB数据库集成。

### 核心技术栈
- **前端**: Next.js 15 + React 19 + TypeScript + Tailwind CSS
- **UI组件**: shadcn/ui (基于Radix UI)
- **桌面应用**: Tauri 2.x (Rust后端)
- **数据库**: MongoDB云数据库 (真实生产环境)
- **认证系统**: 基于JWT token和MongoDB的完整用户管理

## 常用开发命令

### 开发环境
```bash
npm run dev                 # 启动Next.js开发服务器 (http://localhost:3000)
npm run tauri:dev          # 启动Tauri桌面应用开发模式 (推荐)
```

### 构建命令
```bash
npm run build              # 构建Next.js静态站点到out目录
npm run tauri:build        # 构建Tauri桌面应用到NSIS安装包
```

### 代码质量
```bash
npm run lint               # ESLint代码检查 (必须通过)
```

### 数据库操作
```bash
node scripts/create-admin-nodejs.js      # 初始化管理员账号 (admin/admin@2025csch)
node scripts/generate-password-hash.js   # 生成密码哈希工具
```

### 版本管理
```bash
node scripts/update-version.js           # 统一更新package.json和tauri.conf.json版本号
scripts/release-version.bat              # 自动发布新版本(Windows)
scripts/quick-release.bat                # 快速发布脚本
```

### 测试和验证
```bash
node scripts/test-token-auth.js          # 测试Token认证系统
scripts/verify-api-server.ps1            # 验证API服务器状态(PowerShell)
scripts/verify-api-server.sh             # 验证API服务器状态(Shell)
scripts/clean-build.bat                  # 清理构建文件(Windows)
```

## 项目结构详解

### 核心目录架构
```
app/                          # Next.js App Router
├── api/                      # API路由 (Web环境MongoDB访问)
│   ├── admin/               # 管理员API (CRUD操作)
│   └── auth/                # 认证API (登录/登出)
├── layout.tsx               # 根布局 (主题/认证提供者)
├── page.tsx                 # 主页面 (工具网格)
├── login/page.tsx           # 登录页面
└── admin/page.tsx           # 管理员后台

components/                   # React组件
├── ui/                      # shadcn/ui组件库 (完整集成)
├── auth/                    # 认证相关组件
├── admin/                   # 管理员面板组件
├── tool-grid.tsx           # 工具网格 (核心组件)
├── web-view-modal.tsx      # WebView模态框 (工具启动)
└── weather-widget.tsx      # 天气组件

lib/                         # 核心工具库
├── auth/                    # 认证上下文和状态管理
├── database.ts             # MongoDB数据库服务类
├── tauri-api.ts            # Tauri IPC封装
├── tool-data.ts            # 20个工具完整数据配置
└── utils.ts                # 通用工具函数

src-tauri/                   # Tauri后端 (Rust)
├── src/                    # Rust源码
│   ├── main.rs            # 主入口
│   └── auth.rs            # 认证和数据库逻辑
├── tauri.conf.json        # Tauri配置
└── Cargo.toml             # Rust依赖

types/                       # TypeScript类型定义
├── tools.ts               # 工具接口定义
└── weather.ts             # 天气组件类型
```

### 关键配置文件
- `next.config.mjs`: Next.js配置 (SSG导出模式)
- `src-tauri/tauri.conf.json`: Tauri应用配置 (窗口尺寸、安全策略)
- `components.json`: shadcn/ui配置
- `tailwind.config.ts`: Tailwind CSS配置

## 数据库架构

### MongoDB Collections
- `users`: 用户信息 (认证、权限、统计)
- `user_sessions`: 登录会话记录
- `tool_usage`: 工具使用统计和追踪
- `user_activities`: 用户活动日志

### 双环境数据访问模式
1. **Web环境**: Next.js API Routes → MongoDB (开发调试)
2. **桌面环境**: Tauri IPC → Rust Backend → MongoDB (生产部署)

### 数据库连接
- 连接字符串在 `lib/database.ts:5` 和 `src-tauri/src/auth.rs`
- 使用真实生产MongoDB (dbconn.sealosbja.site)
- 密码加密方式: SHA256 + 固定盐值 (与Rust后端一致)

## 工具数据管理

### 工具配置中心 (`lib/tool-data.ts`)
包含22个工具的完整信息，按业务类型组织:
- 13个运营工具 (商家回复解答手册、美团运营知识、外卖数周报系统、图片墙图片分割、文件上传下载中心等)
- 2个美工工具 (图片采集、数据处理)
- 2个销售工具 (数据统计、报告生成)
- 4个人事工具 (财务记账、排班系统等)
- 1个客服工具 (店铺信息采集)

### 工具启动机制
- 通过 `web-view-modal.tsx` 组件启动工具
- 支持全屏WebView显示
- 自动记录使用时长和点击统计
- 错误处理和重试机制

## 认证系统架构

### 核心组件
- `lib/auth/auth-context.tsx`: React Context状态管理
- `components/auth/auth-guard.tsx`: 路由保护组件
- Token存储: localStorage (记住我功能)

### 认证流程
1. 用户登录 → 验证MongoDB → 生成会话
2. 自动登录检测 (remember me / auto login tokens)
3. 会话状态同步 (前端Context + 后端验证)
4. 权限控制 (admin/user角色)

### 路由保护
- `/admin/*`: 仅管理员访问
- `/login`: 未认证用户重定向
- `/`: 需要有效登录会话

## 开发注意事项

### 代码规范
- 使用TypeScript严格模式
- 遵循shadcn/ui组件规范
- Tailwind CSS原子化样式
- 使用Lucide React图标库

### 数据库操作
- 所有MongoDB操作通过 `DatabaseService` 类
- 前端使用 `userToResponse()` 转换数据格式
- 密码加密使用 `hashPassword()` 函数
- 错误处理返回中文提示

### Tauri开发
- IPC调用通过 `lib/tauri-api.ts` 封装
- 支持多重备用机制 (官方API + window.__TAURI__)
- 环境检测和错误处理完善
- 构建目标: NSIS Windows安装包
- 窗口配置: 1480x980 最小尺寸, 支持调整大小

### 安全机制
- 开发者工具保护 (可临时禁用调试)
- CSP安全策略配置
- 密码哈希存储
- 会话状态验证

### 常见问题排查
1. **MongoDB连接失败**: 检查网络连接和凭据
2. **Tauri IPC错误**: 确保端口3000可用，重启开发服务器
3. **认证失败**: 运行初始化脚本创建管理员账号
4. **构建失败**: 检查Rust环境和依赖

## 测试和验证

### 测试账号
- 管理员: `admin` / `admin@2025csch`
- 普通用户: `testuser` / `test123456`

### 功能验证
- 登录系统: Web版本和桌面版本一致性
- 工具启动: 22个工具URL可访问性
- 数据统计: MongoDB聚合查询正确性
- 用户管理: CRUD操作完整性

### 版本发布
- 版本号同步: package.json + tauri.conf.json (当前: package.json v1.0.23, tauri.conf.json v1.0.24)
- 构建验证: 测试桌面应用启动和功能
- 更新检测: 验证自动更新服务器响应
- 版本发布脚本: `scripts/release-version.bat` 和 `scripts/update-version.js`
- 自动更新服务器: `https://www.yujinkeji.asia/api/releases/`

## 重要文件位置

### 必读文件
- `lib/tool-data.ts` - 工具数据配置中心
- `lib/database.ts` - 数据库服务核心
- `lib/auth/auth-context.tsx` - 认证状态管理
- `src-tauri/tauri.conf.json` - 桌面应用配置

### API路由
- `app/api/auth/login/route.ts` - 用户登录
- `app/api/admin/users/route.ts` - 用户列表
- `app/api/admin/overview/route.ts` - 系统统计

### 组件入口
- `app/page.tsx` - 主页面布局
- `components/tool-grid.tsx` - 工具展示网格
- `components/web-view-modal.tsx` - 工具启动界面

## 开发最佳实践

### 代码修改原则
- **工具数据修改**: 只能在 `lib/tool-data.ts` 中修改工具信息，不要直接修改组件中的硬编码数据
- **数据库操作**: 必须通过 `DatabaseService` 类进行，保持数据访问的统一性
- **Tauri API调用**: 使用 `lib/tauri-api.ts` 中封装的方法，避免直接调用原生API
- **环境检测**: 使用 `isTauriEnvironment()` 函数判断运行环境

### 重要开发注意事项
- **版本同步**: 修改版本号时必须同时更新 `package.json` 和 `src-tauri/tauri.conf.json`
- **MongoDB连接**: 数据库连接字符串存在两处，修改时需保持同步：
  - `lib/database.ts:5`
  - `src-tauri/src/auth.rs` 
- **密码加密**: 前后端使用不同但兼容的加密方式，修改时需确保兼容性
- **端口配置**: 开发服务器默认使用3000端口，Tauri配置中的端口必须匹配

### 调试和测试
- **数据库测试**: 使用 `node scripts/test-token-auth.js` 测试认证系统
- **API测试**: Web环境和桌面环境都需要分别测试
- **版本测试**: 使用 `scripts/verify-api-server.ps1` 验证更新服务器状态