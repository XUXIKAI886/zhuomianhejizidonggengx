# 呈尚策划工具箱自动更新系统部署指南

## 🎯 项目概述

基于你的 GitHub 仓库 `https://github.com/XUXIKAI886/zhuomianhejizidonggengx.git`，我已经为你创建了完整的 Vercel 自动更新服务器系统。

## ✅ 已准备好的文件

我已经在 `update-server/` 目录中创建了以下完整的更新服务器代码：

```
update-server/                    # 更新服务器根目录
├── api/                         # Vercel Serverless API
│   ├── releases.js             # 更新检查和版本管理API  
│   └── health.js               # 健康检查API
├── package.json                # 项目配置和依赖
├── vercel.json                 # Vercel 部署配置
├── index.html                  # 精美的服务状态页面
├── .gitignore                  # Git 忽略文件
└── README.md                   # 项目文档
```

## 🚀 立即部署步骤

### 第一步：将更新服务器代码推送到你的仓库

```bash
# 1. 克隆你的仓库
git clone https://github.com/XUXIKAI886/zhuomianhejizidonggengx.git
cd zhuomianhejizidonggengx

# 2. 复制更新服务器文件到仓库根目录
# 将我创建的 update-server 目录下的所有文件复制到你的仓库根目录

# 3. 提交并推送到 GitHub
git add .
git commit -m "feat: 添加 Vercel 自动更新服务器"
git push origin main
```

### 第二步：在 Vercel 中部署

#### 2.1 连接 GitHub 仓库到 Vercel

1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 使用 GitHub 账户登录
3. 点击 **"New Project"**
4. 在 "Import Git Repository" 找到 `zhuomianhejizidonggengx`
5. 点击 **"Import"**

#### 2.2 配置项目设置

**项目配置：**
- **Framework Preset**: Other
- **Root Directory**: `./` (默认)
- **Build Command**: 留空
- **Output Directory**: 留空
- **Install Command**: `npm install`

#### 2.3 设置环境变量

在部署前，点击 **"Environment Variables"** 添加：

```bash
# 管理员访问令牌（必需）
Name: ADMIN_TOKEN
Value: your-super-secret-admin-token-12345-make-it-strong

# API 加密密钥（可选，额外安全层）
Name: ENCRYPTION_KEY  
Value: your-encryption-key-67890-for-security
```

**生成强密码命令：**
```bash
# 使用 Node.js 生成随机字符串
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# 或使用在线工具：https://www.uuidgenerator.net/
```

#### 2.4 完成部署

1. 点击 **"Deploy"** 按钮
2. 等待部署完成（1-2分钟）
3. 获得你的更新服务器地址：`https://your-app-name.vercel.app`

### 第三步：测试更新服务器

#### 3.1 健康检查测试
```bash
curl https://your-app-name.vercel.app/health
```

**预期响应：**
```json
{
  "status": "ok",
  "service": "呈尚策划工具箱自动更新服务",
  "timestamp": "2024-01-30T12:00:00Z",
  "version": "1.0.0",
  "platform": "Vercel Serverless",
  "github_repo": "https://github.com/XUXIKAI886/zhuomianhejizidonggengx"
}
```

#### 3.2 更新检查测试
```bash
curl https://your-app-name.vercel.app/api/releases/windows-x86_64/1.0.0
```

**预期响应（已是最新版本）：**
```json
{
  "version": "1.0.0",
  "notes": "",
  "pub_date": null,
  "platforms": {}
}
```

### 第四步：配置 Tauri 更新端点

编辑你的桌面应用项目中的 `src-tauri/tauri.conf.json` 文件：

#### 4.1 更新配置文件

将更新服务器地址配置到 Tauri：

```json
{
  "plugins": {
    "updater": {
      "endpoints": [
        "https://your-app-name.vercel.app/api/releases/{{target}}/{{current_version}}"
      ],
      "dialog": true,
      "pubkey": "你的数字签名公钥"
    }
  }
}
```

#### 4.2 生成数字签名密钥（如果还没有）

```bash
# 生成密钥对
tauri signer generate -w ~/.tauri/chengshang-tools.key

# 获取公钥并更新到 tauri.conf.json
# 私钥用于签名发布包，公钥用于验证
```

## 🔄 版本发布流程

### 方式一：手动发布新版本

#### 1. 构建桌面应用
```bash
# 在你的桌面应用项目中
npm run tauri build
```

#### 2. 上传到 GitHub Releases
```bash
# 创建新标签
git tag v1.1.0
git push origin v1.1.0

# 在 GitHub 仓库创建 Release 并上传安装包
# 文件名示例: 呈尚策划工具箱-1.1.0-setup.exe
```

#### 3. 更新服务器版本信息
```bash
curl -X POST https://your-app-name.vercel.app/api/releases \
  -H "Authorization: Bearer your-admin-token" \
  -H "Content-Type: application/json" \
  -d '{
    "target": "windows-x86_64",
    "version": "1.1.0",
    "notes": "• 修复了工具启动异常问题\n• 优化了界面响应速度\n• 新增了批量处理功能",
    "signature": "生成的数字签名",
    "url": "https://github.com/XUXIKAI886/zhuomianhejizidonggengx/releases/download/v1.1.0/呈尚策划工具箱-1.1.0-setup.exe"
  }'
```

### 方式二：自动化发布（推荐）

创建 GitHub Actions 自动发布工作流：

```yaml
# .github/workflows/release.yml
name: 自动构建和发布

on:
  push:
    tags:
      - 'v*'

jobs:
  build-and-release:
    runs-on: windows-latest
    steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: '18'
    - name: 构建应用
      run: |
        npm install
        npm run tauri build
    - name: 创建 Release
      uses: softprops/action-gh-release@v1
      with:
        files: src-tauri/target/release/bundle/nsis/*.exe
```

## 🔧 自定义域名配置（可选）

### 1. 在 Vercel 添加自定义域名

1. 进入项目 → Settings → Domains  
2. 添加域名：`api.chengshangcehua.com`
3. 按提示配置 DNS

### 2. DNS 配置

```bash
# 添加 CNAME 记录
类型: CNAME
名称: api
值: cname.vercel-dns.com.
TTL: 300
```

### 3. 更新 Tauri 配置

```json
{
  "plugins": {
    "updater": {
      "endpoints": [
        "https://api.chengshangcehua.com/api/releases/{{target}}/{{current_version}}"
      ],
      "dialog": true,
      "pubkey": "你的数字签名公钥"
    }
  }
}
```

## 📊 监控和维护

### 实时监控

- **Vercel Dashboard**: 查看部署状态和实时日志
- **GitHub**: 监控仓库更新和 Issues
- **自定义监控**: 可添加 Webhook 通知

### 日志查看

```bash
# 安装 Vercel CLI（可选）
npm install -g vercel

# 查看实时日志
vercel logs --follow

# 查看特定函数日志
vercel logs api/releases.js
```

### 性能优化

- **缓存策略**: Vercel 自动启用边缘缓存
- **压缩**: 自动 Gzip/Brotli 压缩
- **CDN**: 全球 Edge Network 加速

## 🔐 安全最佳实践

### 1. Token 安全

- ✅ 使用强随机字符串（至少32位）
- ✅ 定期轮换管理员令牌（建议每3个月）
- ✅ 不要在代码中硬编码敏感信息
- ✅ 使用 Vercel 环境变量管理

### 2. API 安全

- ✅ 所有请求强制使用 HTTPS
- ✅ 严格的输入参数验证
- ✅ 完整的错误处理和日志记录
- ✅ CORS 策略配置

### 3. 版本签名

- ✅ 每个发布版本必须数字签名
- ✅ 私钥安全存储（建议使用 HSM）
- ✅ 公钥配置在 Tauri 配置中

## 🚨 故障排除

### 常见问题

**1. 部署失败**
```bash
# 检查 package.json 和 vercel.json 配置
# 查看 Vercel Dashboard 构建日志
# 确认所有依赖都已正确安装
```

**2. API 返回 500 错误**
```bash
# 检查环境变量是否正确设置
# 查看 Vercel Functions 实时日志
# 确认 API 代码语法无误
```

**3. 自动更新不工作**
```bash
# 确认 Tauri 配置中的 endpoint 地址正确
# 检查数字签名公钥配置
# 验证版本号格式是否符合 semver 规范
```

### 调试技巧

**本地开发：**
```bash
# 安装依赖
npm install

# 启动本地开发服务器
npx vercel dev

# 访问本地API
curl http://localhost:3000/health
```

**生产环境：**
```bash
# 查看部署状态
vercel ls

# 查看项目信息
vercel inspect your-app-name.vercel.app
```

## 💰 成本分析

### Vercel 免费额度
- **函数执行时间**: 100 GB-小时/月
- **带宽**: 100 GB/月  
- **部署次数**: 无限制
- **自定义域名**: 无限制

### 实际使用量估算
- **用户数量**: 1000 用户
- **检查频率**: 每天 2 次
- **月请求量**: 60,000 次
- **单次响应**: ~1KB
- **月带宽**: ~60MB
- **函数执行**: ~0.83 小时/月

**结论**: 完全在免费额度内，成本 **$0/月** 💰

## 🎉 部署完成检查清单

请确认以下项目已完成：

### 基础部署
- [ ] 更新服务器代码已推送到 GitHub 仓库
- [ ] Vercel 项目成功创建并连接 GitHub
- [ ] 环境变量 `ADMIN_TOKEN` 已正确配置
- [ ] 部署成功完成，获得 Vercel 应用地址
- [ ] 健康检查 API 返回正常：`/health`
- [ ] 更新检查 API 响应正常：`/api/releases/windows-x86_64/1.0.0`

### 应用集成
- [ ] Tauri 配置文件已更新更新服务器地址
- [ ] 数字签名密钥对已生成
- [ ] 公钥已配置到 `tauri.conf.json`
- [ ] 桌面应用自动更新功能测试通过

### 版本管理
- [ ] 版本发布 API 测试通过
- [ ] GitHub Releases 发布流程验证
- [ ] 数字签名和验证流程正常
- [ ] 版本回滚机制测试通过

### 监控运维  
- [ ] Vercel Dashboard 监控配置
- [ ] 错误日志和告警设置
- [ ] 性能监控指标正常
- [ ] 备份和恢复流程确认

## 🎯 下一步行动

1. **立即部署**: 按照本指南完成 Vercel 部署
2. **功能测试**: 全面测试所有 API 接口
3. **应用集成**: 更新桌面应用配置并测试
4. **首次发布**: 准备并发布第一个正式版本
5. **监控优化**: 设置完善的监控和告警系统

## 🆘 技术支持

如果在部署过程中遇到任何问题：

1. **查看日志**: 首先检查 Vercel Dashboard 中的函数日志
2. **GitHub Issues**: 在仓库中创建 Issue 描述问题
3. **重新部署**: 尝试重新触发部署解决临时问题
4. **回滚版本**: 如有问题可快速回滚到上一个稳定版本

---

## 🚀 恭喜！

你现在拥有了一个**企业级、全球加速、零成本**的自动更新服务器！

**主要优势：**
- ✅ **Git 推送自动部署** - 现代化 DevOps 工作流
- ✅ **全球 CDN 加速** - Vercel Edge Network  
- ✅ **企业级可靠性** - 99.99% 服务可用性
- ✅ **零运维成本** - 无需服务器管理
- ✅ **完整的安全保护** - Token 认证 + 数字签名

现在开始享受 **`git push` 即可更新生产环境** 的便利吧！🎉