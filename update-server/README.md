# 呈尚策划工具箱自动更新服务器

🚀 基于 Vercel + GitHub 的企业级自动更新服务器，为呈尚策划工具箱桌面应用提供安全、快速的自动更新服务。

## ✨ 功能特性

- 🔄 **自动更新检查** - 支持 Tauri 应用自动更新机制
- 🛡️ **数字签名验证** - 确保更新包完整性和安全性  
- 🌍 **全球CDN加速** - Vercel Edge Network 全球分发
- 📊 **版本管理API** - 支持版本发布和回滚
- 💰 **零成本运行** - Vercel 免费额度足够大部分应用
- 🔐 **安全认证** - 管理员Token保护版本发布接口
- 📝 **详细日志** - 完整的操作日志和错误追踪

## 🏗️ 架构说明

```
GitHub Repository (本仓库)
    ↓ Git 推送自动部署
Vercel Serverless Functions  
    ↓ 提供更新API服务
呈尚策划工具箱桌面应用
    ↓ 自动检查更新
最终用户设备自动更新
```

## 📁 项目结构

```
update-server/
├── api/                    # Vercel Serverless API
│   ├── releases.js        # 更新检查和版本管理
│   └── health.js          # 健康检查
├── package.json           # 项目配置
├── vercel.json           # Vercel 部署配置
├── .gitignore            # Git 忽略文件
├── index.html            # 服务状态页面
└── README.md             # 本文档
```

## 🔧 API 接口文档

### 1. 更新检查 API
```http
GET /api/releases/{target}/{current_version}
```

**参数说明:**
- `target`: 目标平台 (如: `windows-x86_64`)
- `current_version`: 当前版本号 (如: `1.0.0`)

**响应示例 (有更新):**
```json
{
  "version": "1.1.0",
  "notes": "• 修复了工具启动异常问题\n• 优化了界面响应速度\n• 新增了批量处理功能",
  "pub_date": "2024-01-30T12:00:00Z",
  "platforms": {
    "windows-x86_64": {
      "signature": "dW50cnVzdGVkIGNvbW1lbnQ6...",
      "url": "https://github.com/XUXIKAI886/zhuomianhejizidonggengx/releases/download/v1.1.0/setup.exe"
    }
  }
}
```

### 2. 版本管理 API
```http
POST /api/releases
Authorization: Bearer {ADMIN_TOKEN}
Content-Type: application/json
```

**请求体:**
```json
{
  "target": "windows-x86_64",
  "version": "1.1.0",
  "notes": "• 修复bug\n• 新增功能",
  "signature": "数字签名",
  "url": "下载链接"
}
```

### 3. 健康检查 API
```http
GET /health
```

**响应:**
```json
{
  "status": "ok",
  "service": "呈尚策划工具箱自动更新服务",
  "timestamp": "2024-01-30T12:00:00Z",
  "version": "1.0.0",
  "platform": "Vercel Serverless"
}
```

## 📊 使用统计

- ✅ **当前服务版本**: v1.0.0
- ✅ **支持平台**: Windows x64
- ✅ **服务状态**: 🟢 正常运行
- ✅ **GitHub仓库**: [zhuomianhejizidonggengx](https://github.com/XUXIKAI886/zhuomianhejizidonggengx)

## 🚀 快速测试

```bash
# 健康检查
curl https://your-app.vercel.app/health

# 更新检查
curl https://your-app.vercel.app/api/releases/windows-x86_64/1.0.0

# 版本发布 (需要管理员Token)
curl -X POST https://your-app.vercel.app/api/releases \
  -H "Authorization: Bearer your-admin-token" \
  -H "Content-Type: application/json" \
  -d '{"target":"windows-x86_64","version":"1.1.0","notes":"更新说明","signature":"签名","url":"下载链接"}'
```

## 🔐 安全特性

- ✅ **HTTPS 强制** - 所有请求必须使用 HTTPS
- ✅ **Token 认证** - 版本发布需要管理员令牌
- ✅ **CORS 支持** - 跨域请求安全处理
- ✅ **输入验证** - 严格的参数验证和错误处理
- ✅ **日志记录** - 完整的操作日志追踪

## 📝 更新日志

### v1.0.0 (2024-01-30)
- ✨ 初始版本发布
- ✨ 支持 Windows x64 平台自动更新
- ✨ 实现版本检查和管理API
- ✨ 集成 Vercel 自动部署
- ✨ 添加健康检查和监控
- ✨ 完善的错误处理和日志记录

## 🛠️ 本地开发

```bash
# 安装依赖
npm install

# 本地开发服务器
npx vercel dev

# 访问本地服务
open http://localhost:3000
```

## 🤝 贡献指南

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 详情请查看 [LICENSE](../LICENSE) 文件

## 🆘 技术支持

- 🐛 **问题反馈**: [GitHub Issues](https://github.com/XUXIKAI886/zhuomianhejizidonggengx/issues)
- 📧 **联系邮箱**: 请通过 GitHub Issues 联系
- 📖 **文档**: 详细部署文档请查看根目录的部署指南

## 🌟 致谢

感谢以下技术和平台的支持：
- [Vercel](https://vercel.com) - 提供免费的 Serverless 部署平台
- [Tauri](https://tauri.app) - 现代桌面应用框架
- [GitHub](https://github.com) - 代码托管和版本控制

---

**由呈尚策划团队开发和维护** | **Powered by Vercel** 🚀

> 本服务器为呈尚策划工具箱桌面应用提供自动更新支持，确保用户始终使用最新版本。