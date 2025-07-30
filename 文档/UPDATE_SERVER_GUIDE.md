# 自动更新服务器配置指南

## 📋 概述

本文档详细介绍如何为呈尚策划工具箱配置自动更新服务器，实现应用的自动更新推送功能。

## 🔄 更新机制说明

### 当前状态
- ✅ **已添加Tauri更新器插件**
- ✅ **已配置前端更新检查组件**
- ⚠️ **需要配置更新服务器**
- ⚠️ **需要生成签名密钥**

### 更新流程
1. **应用启动** → 自动检查更新（延迟3秒）
2. **发现更新** → 显示更新对话框
3. **用户确认** → 下载更新包
4. **下载完成** → 自动重启应用
5. **应用更新** → 新版本生效

## 🔧 配置步骤

### 1. 生成签名密钥对

```bash
# 安装Tauri CLI（如果未安装）
cargo install tauri-cli

# 生成密钥对
tauri signer generate -w ~/.tauri/myapp.key

# 输出示例：
# Private key: ~/.tauri/myapp.key
# Public key: dW50cnVzdGVkIGNvbW1lbnQ6IHNpZ25hdHVyZSBmcm9tIHRhdXJpIHNlY3JldCBrZXkKUldUNEJXRjZQNjJIUDJGV...
```

### 2. 更新Tauri配置

将生成的公钥添加到 `src-tauri/tauri.conf.json`：

```json
{
  "updater": {
    "active": true,
    "endpoints": [
      "https://your-domain.com/api/releases/{{target}}/{{current_version}}"
    ],
    "dialog": true,
    "pubkey": "dW50cnVzdGVkIGNvbW1lbnQ6IHNpZ25hdHVyZSBmcm9tIHRhdXJpIHNlY3JldCBrZXkKUldUNEJXRjZQNjJIUDJGV..."
  }
}
```

### 3. 更新服务器API规范

#### 请求格式
```
GET /api/releases/{target}/{current_version}

参数说明：
- target: 目标平台 (如: x86_64-pc-windows-msvc)
- current_version: 当前版本 (如: 1.0.0)
```

#### 响应格式

**有更新时：**
```json
{
  "version": "1.1.0",
  "notes": "修复了若干问题，新增了自动更新功能",
  "pub_date": "2025-07-29T10:00:00Z",
  "platforms": {
    "windows-x86_64": {
      "signature": "dW50cnVzdGVkIGNvbW1lbnQ6IHNpZ25hdHVyZSBmcm9tIHRhdXJpIHNlY3JldCBrZXkK...",
      "url": "https://your-domain.com/releases/v1.1.0/app-setup.exe"
    }
  }
}
```

**无更新时：**
```json
{
  "version": "1.0.0",
  "notes": "当前已是最新版本",
  "pub_date": "2025-07-29T10:00:00Z"
}
```

## 🚀 部署方案

### 方案1: 简单静态服务器

#### 1. 创建更新API
```javascript
// update-server.js (Node.js + Express)
const express = require('express');
const app = express();

// 版本信息配置
const releases = {
  "1.1.0": {
    version: "1.1.0",
    notes: "修复了若干问题，新增了自动更新功能",
    pub_date: "2025-07-29T10:00:00Z",
    platforms: {
      "windows-x86_64": {
        signature: "YOUR_SIGNATURE_HERE",
        url: "https://your-domain.com/releases/v1.1.0/app-setup.exe"
      }
    }
  }
};

app.get('/api/releases/:target/:version', (req, res) => {
  const { target, version } = req.params;
  
  // 获取最新版本
  const latestVersion = Object.keys(releases).sort().pop();
  const currentRelease = releases[latestVersion];
  
  // 检查是否有更新
  if (version < latestVersion) {
    res.json(currentRelease);
  } else {
    res.json({
      version: version,
      notes: "当前已是最新版本",
      pub_date: new Date().toISOString()
    });
  }
});

app.listen(3000, () => {
  console.log('更新服务器运行在端口 3000');
});
```

#### 2. 部署到云服务
```bash
# 部署到Vercel
npm install -g vercel
vercel --prod

# 部署到Netlify
npm install -g netlify-cli
netlify deploy --prod

# 部署到自己的服务器
pm2 start update-server.js
```

### 方案2: GitHub Releases（推荐）

#### 1. 配置GitHub Actions
```yaml
# .github/workflows/release.yml
name: Release
on:
  push:
    tags:
      - 'v*'

jobs:
  release:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Setup Rust
        uses: dtolnay/rust-toolchain@stable
        
      - name: Install dependencies
        run: pnpm install
        
      - name: Build and release
        env:
          TAURI_PRIVATE_KEY: ${{ secrets.TAURI_PRIVATE_KEY }}
        run: |
          npm run tauri:build
          
      - name: Create Release
        uses: tauri-apps/tauri-action@v0
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          TAURI_PRIVATE_KEY: ${{ secrets.TAURI_PRIVATE_KEY }}
        with:
          tagName: ${{ github.ref_name }}
          releaseName: 'Release ${{ github.ref_name }}'
          releaseBody: 'See the assets to download and install this version.'
```

#### 2. 更新配置使用GitHub
```json
{
  "updater": {
    "active": true,
    "endpoints": [
      "https://api.github.com/repos/your-username/your-repo/releases/latest"
    ],
    "dialog": true,
    "pubkey": "YOUR_PUBLIC_KEY"
  }
}
```

## 📦 发布新版本流程

### 1. 更新版本号
```bash
# 使用脚本自动更新版本
node scripts/update-version.js 1.1.0

# 或手动更新以下文件：
# - package.json
# - src-tauri/tauri.conf.json  
# - src-tauri/Cargo.toml
```

### 2. 构建和签名
```bash
# 设置私钥环境变量
export TAURI_PRIVATE_KEY="$(cat ~/.tauri/myapp.key)"

# 构建应用
npm run tauri:build

# 生成的文件会自动签名
```

### 3. 上传到服务器
```bash
# 上传安装包到文件服务器
scp src-tauri/target/release/bundle/nsis/*.exe user@server:/var/www/releases/

# 更新API响应中的下载链接和签名
```

### 4. 测试更新
```bash
# 在旧版本应用中测试更新检查
# 确认更新对话框显示正确
# 验证下载和安装流程
```

## 🔒 安全考虑

### 1. 签名验证
- ✅ 使用Ed25519签名算法
- ✅ 私钥安全存储（环境变量）
- ✅ 公钥嵌入应用配置

### 2. HTTPS传输
- ✅ 更新服务器必须使用HTTPS
- ✅ 下载链接必须使用HTTPS
- ✅ 防止中间人攻击

### 3. 版本验证
- ✅ 语义化版本比较
- ✅ 防止版本回滚攻击
- ✅ 签名完整性检查

## 🐛 故障排除

### 常见问题

**Q: 更新检查失败**
```
解决方案：
1. 检查网络连接
2. 验证更新服务器URL
3. 确认API响应格式正确
4. 查看浏览器控制台错误
```

**Q: 签名验证失败**
```
解决方案：
1. 确认公钥配置正确
2. 验证私钥签名过程
3. 检查文件完整性
4. 重新生成密钥对
```

**Q: 下载失败**
```
解决方案：
1. 检查下载链接可访问性
2. 验证文件服务器配置
3. 确认文件权限设置
4. 检查防火墙设置
```

## 📊 监控和分析

### 更新统计
```javascript
// 在更新服务器中添加统计
app.get('/api/releases/:target/:version', (req, res) => {
  // 记录更新检查
  console.log(`Update check: ${req.params.version} -> ${latestVersion}`);
  
  // 可以集成到分析服务
  analytics.track('update_check', {
    current_version: req.params.version,
    latest_version: latestVersion,
    user_agent: req.headers['user-agent']
  });
  
  // 返回更新信息
  res.json(updateInfo);
});
```

### 成功率监控
- 更新检查成功率
- 下载完成率  
- 安装成功率
- 用户更新采用率

## 🎯 最佳实践

1. **渐进式发布**: 先发布给小部分用户测试
2. **回滚机制**: 准备快速回滚到上一版本
3. **更新通知**: 在应用中显示更新日志
4. **用户选择**: 允许用户选择更新时机
5. **网络优化**: 使用CDN加速下载
6. **错误处理**: 提供详细的错误信息和解决方案

---

## 📞 技术支持

配置自动更新时如遇问题，请：

1. 查看Tauri官方文档
2. 检查配置文件格式
3. 验证签名密钥
4. 测试更新服务器API
5. 联系开发团队

**联系方式**: support@chengshangcehua.com
