# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目架构概述

这是一个基于Tauri 2.x + Next.js 15的桌面应用"呈尚策划工具中心"，集成34个专业工具，包含完整的用户认证系统和MongoDB数据库集成。

### 核心技术栈
- **前端**: Next.js 15.2.4 + React 19 + TypeScript + Tailwind CSS
- **UI组件**: shadcn/ui (基于Radix UI)
- **桌面应用**: Tauri 2.x (Rust后端)
- **数据库**: MongoDB云数据库 (真实生产环境)
- **认证系统**: 基于JWT token和MongoDB的完整用户管理

## 常用开发命令

### 开发环境
```bash
npm run dev                 # 启动Next.js开发服务器 (http://localhost:3000)
npm run tauri:dev          # 启动Tauri桌面应用开发模式
```

### 构建命令
```bash
npm run build              # 构建Next.js静态站点到out目录
npm run tauri:build        # 构建Tauri桌面应用到NSIS安装包
```

### 数据库操作
```bash
node scripts/create-admin-nodejs.js      # 初始化管理员账号 (admin/admin@2025csch)
```

## 工具数据管理

### 工具配置中心 (`lib/tool-data.ts`)
包含34个工具的完整信息，按业务类型组织:
- 20个运营工具 (商家回复手册、外卖知识系统、数据可视化、关键词描述生成等)
- 3个美工工具 (图片采集、数据处理、外卖图片系统)
- 2个销售工具 (数据统计、报告生成)
- 7个人事工具 (财务记账、排班系统、面试系统、项目集合、回款统计等)
- 1个客服工具 (店铺信息采集)
- 1个公司官网 (呈尚策划官方网站)

## 添加新工具流程

### 修改文件清单
添加新工具时,需要按以下顺序修改4个核心文件:

#### 1. lib/tool-data.ts - 添加工具数据和图标导入
```typescript
// 1. 在文件顶部导入需要的图标
import { DollarSign } from "lucide-react"

// 2. 在 toolsData 数组中添加新工具对象
{
  id: 35,  // 使用下一个可用ID
  name: "工具名称",
  description: "工具描述",
  category: "运营工具",
  url: "https://工具URL.com/",
  icon: DollarSign,
  rating: 4.8,
  downloads: "0.5k",
  tags: ["标签1", "标签2", "标签3"],
  color: "from-blue-300 to-blue-400",
  featured: true,
  lastUpdated: "今天",
  toolType: "web"
}
```

#### 2. README.md - 更新工具数量和详细清单
需要更新以下10+处位置:
- 标题: "集成XX个专业工具"
- 分类统计表: 更新对应分类的数量
- 最新工具信息
- 详细工具清单: 添加新工具条目

#### 3. src-tauri/tauri.conf.json - 更新bundle配置
```json
{
  "bundle": {
    "longDescription": "集成XX个专业工具的桌面应用"
  }
}
```

#### 4. HTTP权限配置 (如需要)
如果新工具需要访问外部API，需要配置HTTP权限:

**文件**: `src-tauri/capabilities/http-capability.json`

```json
{
  "identifier": "http:allow-fetch",
  "allow": [
    {
      "url": "https://新工具域名.com/**"
    }
  ]
}
```

### 工具分类颜色标准
```typescript
运营工具: "from-blue-300 to-blue-400"
美工工具: "from-purple-300 to-purple-400"
销售工具: "from-emerald-300 to-emerald-400"
人事工具: "from-amber-300 to-amber-400"
客服工具: "from-rose-300 to-rose-400"
公司官网: "from-indigo-400 to-indigo-600"
```

## 常见问题排查

### 1. 端口3000被占用
```bash
# Windows系统
netstat -ano | findstr :3000
taskkill //F //PID <进程ID>
```

### 2. 工具内POST请求失败
**症状**: 桌面应用中工具的POST请求返回500错误

**解决方案**:
1. 编辑 `src-tauri/capabilities/http-capability.json`
2. 在 `allow` 数组中添加该域名
3. 重启开发服务器

### 3. Rust编译警告
12个snake_case命名警告是预期的，可以安全忽略。

### 4. 新添加的工具不显示
1. 检查 `lib/tool-data.ts` 中是否正确添加
2. 确认工具ID唯一
3. 检查图标是否正确导入
4. 重启开发服务器

## 项目统计 (v1.0.27)

- **工具总数**: 34个专业工具
- **运营工具**: 20个
- **美工工具**: 3个
- **销售工具**: 2个
- **人事工具**: 7个
- **客服工具**: 1个
- **公司官网**: 1个

---

**最后更新**: 2025年10月15日
**当前版本**: v1.0.27
