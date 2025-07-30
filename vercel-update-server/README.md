# 呈尚策划工具箱更新服务器

🚀 基于 Vercel + GitHub 的自动更新服务器，为呈尚策划工具箱提供企业级自动更新服务。

## ✨ 功能特性

- 🔄 **自动更新检查** - 支持 Tauri 应用自动更新机制
- 🛡️ **数字签名验证** - 确保更新包完整性和安全性  
- 🌍 **全球CDN加速** - Vercel Edge Network 全球分发
- 📊 **版本管理API** - 支持版本发布和回滚
- 💰 **零成本运行** - Vercel 免费额度足够大部分应用
- 🔐 **安全认证** - 管理员Token保护版本发布接口

## 🏗️ 架构说明

```
GitHub Repository (本仓库)
    ↓ 自动部署
Vercel Serverless Functions
    ↓ 提供API服务  
Tauri 桌面应用
    ↓ 检查更新
最终用户设备
```

## 📁 项目结构

```
├── api/                    # Vercel Serverless API
│   ├── releases.js        # 更新检查和版本管理
│   └── health.js          # 健康检查
├── package.json           # 项目配置
├── vercel.json           # Vercel 部署配置
├── index.html            # 服务状态页面
├── .github/              # GitHub Actions
│   └── workflows/
│       └── deploy.yml    # 自动部署工作流
└── README.md             # 本文档
```

## 🚀 快速开始

### 1. Fork 或创建仓库

点击右上角 **Fork** 按钮，或创建新的 GitHub 仓库。

### 2. 连接到 Vercel

1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 点击 **New Project**
3. 选择你的 GitHub 仓库
4. 点击 **Import** 

### 3. 配置环境变量

在 Vercel 项目设置中添加：

```bash
ADMIN_TOKEN=your-super-secret-admin-token-here
ENCRYPTION_KEY=your-encryption-key-here
```

### 4. 自动部署

推送代码到 `main` 分支即可自动部署：

```bash
git add .
git commit -m "deploy: 初始化更新服务器"
git push origin main
```

## 🔧 API 接口

### 更新检查
```http
GET /api/releases/{target}/{current_version}
```

### 版本管理  
```http
POST /api/releases
Authorization: Bearer {ADMIN_TOKEN}
```

### 健康检查
```http
GET /health
```

## 📊 使用统计

- ✅ **已服务更新检查**: 0 次
- ✅ **当前版本**: 1.0.0  
- ✅ **服务状态**: 🟢 正常运行

## 🛠️ 本地开发

```bash
# 安装依赖
npm install

# 本地开发（需要 Vercel CLI）
npx vercel dev

# 访问本地服务
open http://localhost:3000
```

## 📝 更新日志

### v1.0.0 (2024-01-30)
- ✨ 初始版本发布
- ✨ 支持 Windows x64 平台
- ✨ 实现版本检查和管理API
- ✨ 集成 Vercel 自动部署

## 🤝 贡献指南

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🆘 问题反馈

如果遇到问题，请创建 [Issue](../../issues) 或联系维护者。

---

**由呈尚策划团队维护** | **Powered by Vercel** 🚀