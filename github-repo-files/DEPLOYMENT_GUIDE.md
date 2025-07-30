# GitHub + Vercel 自动更新系统部署指南

> 专为呈尚策划工具箱项目定制的完整部署指南

## 🎯 项目概述

此指南将帮助你将呈尚策划工具箱的自动更新系统部署到 Vercel，实现：
- ✅ Git 推送自动部署
- ✅ 零成本企业级更新服务器  
- ✅ 全球 CDN 加速
- ✅ 99.99% 服务可用性

**你的 GitHub 仓库**: `https://github.com/XUXIKAI886/zhuomianhejizidonggengx.git`

## 🚀 快速部署（3步完成）

### 第一步：推送更新服务器代码

所有必需的文件已经准备好，只需要推送到你的 GitHub 仓库：

```bash
# 1. 克隆你的仓库
git clone https://github.com/XUXIKAI886/zhuomianhejizidonggengx.git
cd zhuomianhejizidonggengx

# 2. 将准备好的文件复制到仓库根目录
# (从 github-repo-files 目录复制所有文件)

# 3. 提交并推送
git add .
git commit -m "feat: 添加 Vercel 自动更新服务器系统

🚀 新增功能:
- 完整的更新检查 API
- 版本管理和发布接口  
- 企业级安全保护
- 精美的服务状态页面
- 全球 CDN 加速支持"

git push origin main
```

### 第二步：在 Vercel 部署

#### 2.1 连接 GitHub 仓库

1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 使用 GitHub 账户登录
3. 点击 **"New Project"**
4. 找到 `zhuomianhejizidonggengx` 仓库
5. 点击 **"Import"**

#### 2.2 配置项目设置

**保持默认设置即可：**
- Framework Preset: Other ✅
- Root Directory: `./` ✅
- Build Command: (留空) ✅
- Output Directory: (留空) ✅
- Install Command: `npm install` ✅

#### 2.3 设置环境变量

点击 **"Environment Variables"** 添加：

```bash
# 管理员访问令牌（必需）
Name: ADMIN_TOKEN  
Value: chengshang-admin-token-2024-secure-key-88888

# API 加密密钥（可选，额外安全层）
Name: ENCRYPTION_KEY
Value: chengshang-encryption-key-2024-secret-99999
```

**强密码生成建议：**
```bash
# 使用组合: 项目名 + admin/encryption + 年份 + 随机数字
# 示例: chengshang-admin-2024-88888
```

#### 2.4 完成部署

1. 点击 **"Deploy"** 按钮
2. 等待 1-2 分钟完成部署
3. 获得你的服务器地址：
   ```
   https://zhuomianhejizidonggengx.vercel.app
   ```

### 第三步：验证部署成功

#### 3.1 访问服务状态页面
打开浏览器访问：
```
https://zhuomianhejizidonggengx.vercel.app
```

你将看到精美的服务状态页面，显示服务正常运行。

#### 3.2 测试 API 接口

```bash
# 健康检查
curl https://zhuomianhejizidonggengx.vercel.app/health

# 更新检查（模拟桌面应用请求）
curl https://zhuomianhejizidonggengx.vercel.app/api/releases/windows-x86_64/1.0.0
```

#### 3.3 验证管理员接口

```bash
# 版本发布测试（使用你设置的 ADMIN_TOKEN）
curl -X POST https://zhuomianhejizidonggengx.vercel.app/api/releases \
  -H "Authorization: Bearer chengshang-admin-token-2024-secure-key-88888" \
  -H "Content-Type: application/json" \
  -d '{
    "target": "windows-x86_64",
    "version": "1.0.1",
    "notes": "测试版本发布功能",
    "signature": "test-signature",
    "url": "https://github.com/XUXIKAI886/zhuomianhejizidonggengx/releases/download/v1.0.1/test.exe"
  }'
```

## ✅ 部署成功！

恭喜！你的自动更新服务器已经成功部署并运行。

### 🌟 你现在拥有：

- **🌐 更新服务器**: `https://zhuomianhejizidonggengx.vercel.app`
- **📊 状态监控**: 实时服务状态和性能监控
- **🔧 管理接口**: 版本发布和管理 API
- **🔒 企业级安全**: Token 认证 + 数字签名验证
- **⚡ 全球加速**: Vercel Edge Network CDN
- **💰 零成本运行**: 完全免费的 Serverless 服务

## 🔄 版本发布流程

### 自动化发布工作流

1. **构建新版本**
   ```bash
   # 在桌面应用项目中
   npm run tauri build
   ```

2. **创建 GitHub Release**
   ```bash
   git tag v1.1.0
   git push origin v1.1.0
   # 在 GitHub 创建 Release 并上传安装包
   ```

3. **更新服务器版本信息**
   ```bash
   curl -X POST https://zhuomianhejizidonggengx.vercel.app/api/releases \
     -H "Authorization: Bearer your-admin-token" \
     -H "Content-Type: application/json" \
     -d '{
       "target": "windows-x86_64",
       "version": "1.1.0",
       "notes": "• 修复了重要问题\n• 新增实用功能",
       "signature": "你生成的数字签名",
       "url": "https://github.com/XUXIKAI886/zhuomianhejizidonggengx/releases/download/v1.1.0/setup.exe"
     }'
   ```

## 🔧 桌面应用配置

你的 Tauri 配置已经自动更新为指向新的更新服务器：

```json
{
  "plugins": {
    "updater": {
      "endpoints": [
        "https://zhuomianhejizidonggengx.vercel.app/api/releases/{{target}}/{{current_version}}"
      ],
      "dialog": true,
      "pubkey": "你的数字签名公钥"
    }
  }
}
```

## 📊 监控和维护

### 实时监控

- **Vercel Dashboard**: [https://vercel.com/dashboard](https://vercel.com/dashboard)
- **服务状态**: [https://zhuomianhejizidonggengx.vercel.app](https://zhuomianhejizidonggengx.vercel.app)
- **API健康检查**: [https://zhuomianhejizidonggengx.vercel.app/health](https://zhuomianhejizidonggengx.vercel.app/health)

### 日志查看

```bash
# 安装 Vercel CLI（可选）
npm install -g vercel

# 查看实时日志
vercel logs --follow

# 查看特定函数日志
vercel logs api/releases.js
```

## 🛡️ 安全最佳实践

### 1. Token 管理
- ✅ 使用强随机字符串（建议32位以上）
- ✅ 定期轮换管理员令牌（建议每3个月）
- ✅ 不要在客户端代码中暴露管理员令牌

### 2. 版本签名
- ✅ 每个发布版本必须进行数字签名
- ✅ 私钥安全存储，不要提交到代码仓库
- ✅ 定期验证签名完整性

### 3. 访问控制
- ✅ 仅授权人员可以发布版本
- ✅ 记录所有版本发布操作
- ✅ 定期审查访问日志

## 🚨 故障排除

### 常见问题及解决方案

**1. 部署失败**
```bash
# 检查文件是否正确复制
# 查看 Vercel Dashboard 构建日志
# 确认 package.json 和 vercel.json 格式正确
```

**2. API 返回 500 错误**
```bash
# 检查环境变量 ADMIN_TOKEN 是否设置
# 查看 Vercel Functions 实时日志
# 确认请求格式和参数正确
```

**3. 自动更新不工作**
```bash
# 确认桌面应用中的 endpoint 地址正确
# 检查数字签名公钥配置
# 验证版本号格式符合 semver 规范
```

## 💡 进阶功能

### 1. 自定义域名

在 Vercel Dashboard 中添加自定义域名：
```
api.chengshangcehua.com → zhuomianhejizidonggengx.vercel.app
```

### 2. 数据持久化

可以集成 Vercel KV 或外部数据库：
```javascript
import { kv } from '@vercel/kv';
await kv.set('releases:windows-x86_64', releases);
```

### 3. 灰度发布

支持按百分比控制更新推送：
```javascript
function shouldGetUpdate(userAgent, rolloutPercent = 50) {
  // 实现灰度发布逻辑
}
```

## 📞 技术支持

如遇到问题，请按以下顺序寻求帮助：

1. **查看日志**: Vercel Dashboard → Functions → 查看错误日志
2. **GitHub Issues**: 在仓库中创建 Issue 描述问题
3. **重新部署**: 尝试重新触发 Vercel 部署
4. **回滚版本**: 可以快速回滚到上一个稳定版本

---

## 🎉 部署完成检查清单

请确认以下项目：

### 基础部署
- [ ] 更新服务器代码已推送到 GitHub
- [ ] Vercel 项目创建并连接成功
- [ ] 环境变量 `ADMIN_TOKEN` 配置正确
- [ ] 部署成功，获得 Vercel 应用地址
- [ ] 服务状态页面可以正常访问
- [ ] API 健康检查返回正常

### 功能验证
- [ ] 更新检查 API 响应正确
- [ ] 版本发布 API 测试通过
- [ ] 桌面应用配置已更新
- [ ] 数字签名验证流程正常

### 监控运维
- [ ] Vercel Dashboard 监控正常
- [ ] 错误日志和告警配置
- [ ] 定期维护计划制定

**🎊 恭喜！你的企业级自动更新系统已成功部署并运行！**

现在你可以享受：
- ✅ **`git push` 自动部署**
- ✅ **全球 CDN 加速访问**
- ✅ **99.99% 服务可用性**
- ✅ **零运维成本**
- ✅ **企业级安全保护**

开始使用你的专业自动更新服务器吧！ 🚀