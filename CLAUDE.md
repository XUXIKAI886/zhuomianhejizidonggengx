# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

这是一个基于 Tauri + Next.js 的桌面应用项目"呈尚策划工具箱"，集成了19个专业工具，服务于运营、美工、销售、人事、客服等不同岗位的工作需求。应用采用现代化的 UI 设计和企业级安全保护机制。

## 核心技术栈

### 前端技术
- **Next.js 15** - 全栈框架，使用SSG静态生成
- **React 19** - 前端UI框架
- **TypeScript** - 类型安全开发
- **Tailwind CSS** - 原子化CSS框架
- **shadcn/ui** - 高质量组件库，基于 Radix UI
- **Lucide React** - 现代化图标库
- **Framer Motion** - 动画库
- **Next Themes** - 主题切换支持

### 桌面应用
- **Tauri 2.x** - 桌面应用框架
- **Rust** - 后端核心逻辑
- **WebView2** - 前端渲染引擎

## 常用开发命令

### 开发模式
```bash
npm run dev                 # 启动 Next.js 开发服务器
npm run tauri:dev          # 启动 Tauri 开发模式（推荐）
```

### 构建命令
```bash
npm run build              # 构建 Next.js 静态站点
npm run tauri:build        # 构建 Tauri 桌面应用
```

### 其他命令
```bash
npm run lint               # ESLint 代码检查
npm run start              # 启动生产模式 Next.js 服务器
npm run tauri              # Tauri CLI 命令
```

## 项目架构

### 核心目录结构

- `src-tauri/` - Tauri 后端代码（Rust）
  - `src/main.rs` - 主程序入口
  - `tauri.conf.json` - Tauri 配置文件
- `app/` - Next.js App Router 目录
  - `layout.tsx` - 根布局，包含主题和开发者工具保护
  - `page.tsx` - 主页面组件
- `components/` - React 组件
  - `ui/` - shadcn/ui 组件库
  - `dev-tools-blocker.tsx` - 开发者工具保护组件
  - `web-view-modal.tsx` - WebView 模态框组件
  - `tool-grid.tsx` - 工具网格展示组件
- `lib/` - 工具库
  - `tool-data.ts` - 19个工具的完整数据配置
  - `utils.ts` - 通用工具函数（基于clsx和tailwind-merge）
- `types/` - TypeScript 类型定义
  - `tools.ts` - 工具相关接口定义

### 数据管理

工具数据全部定义在 `lib/tool-data.ts` 中，包含19个工具的完整信息：
- 10个运营工具
- 2个美工工具  
- 2个销售工具
- 4个人事工具
- 1个客服工具

每个工具包含：id、name、description、category、url、icon、rating、downloads、tags、color、featured、lastUpdated、toolType等属性。

### 核心功能模块

1. **工具管理系统**：基于 `lib/tool-data.ts` 的完整工具数据
2. **分类筛选**：按岗位分类（运营、美工、销售、人事、客服）
3. **WebView 集成**：通过 `web-view-modal.tsx` 在应用内启动工具
4. **安全保护**：通过 `dev-tools-blocker.tsx` 实现多层次开发者工具禁用
5. **主题系统**：基于 next-themes 的亮色主题
6. **Toast 通知**：使用 sonner 库提供用户反馈

## Tauri 配置要点

### 应用配置 (tauri.conf.json)
- 产品名称：`呈尚策划项目展示`
- 窗口尺寸：1200x800，最小1000x700
- 前端构建目录：`../out` (Next.js SSG输出)
- 开发URL：`http://localhost:3000`
- 安全设置：CSP为null，开发者工具已禁用

### Next.js 配置 (next.config.mjs)
- 输出模式：`export` (静态生成)
- 图片优化：关闭（`unoptimized: true`）
- 构建忽略：ESLint 和 TypeScript 错误
- 开发环境：抑制水合不匹配警告

## 开发注意事项

### 安全保护机制
应用实现了企业级安全保护，包括：
- 禁用F12和所有开发者工具快捷键
- 禁用右键菜单和检查元素
- 禁用文本选择和页面保存
- 多层次保护：Tauri配置 + JavaScript事件拦截 + CSS样式保护

在开发时请注意不要破坏这些保护机制。

### 组件开发规范
- 使用 shadcn/ui 组件库保持设计一致性
- 遵循 TypeScript 严格模式
- 使用 Tailwind CSS 进行样式开发
- 图标使用 Lucide React
- 动画使用 Framer Motion

### 工具数据更新
修改工具信息时，请更新 `lib/tool-data.ts` 文件，确保：
- 工具分类统计正确
- 类型定义匹配
- URL 可访问性
- 数据完整性

### WebView 功能
- 所有工具通过内置 WebView 启动
- 支持全屏模式
- 包含错误处理和重试机制
- 遵循安全保护机制

## 项目状态

当前版本：v0.1.0，完成度90%
主要功能已实现，待开发功能包括系统托盘集成、使用统计分析等高级功能。