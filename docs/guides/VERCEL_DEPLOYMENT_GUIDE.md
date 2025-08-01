# 呈尚策划工具箱 GitHub + Vercel 自动更新服务器部署指南

## 🎯 方案概述

通过 GitHub 仓库 + Vercel 自动部署的方式实现企业级自动更新服务器，具有 Git 工作流集成、团队协作友好、零配置部署等优势。

## ✨ GitHub + Vercel 部署优势

### 🚀 开发效率优势
- **Git 工作流集成**：`git push` 即可自动部署生产环境
- **无需本地CLI**：不需要安装和配置 Vercel CLI 工具
- **预览部署**：每个 Pull Request 自动生成预览链接
- **版本控制**：每次部署都有对应的 Git 提交记录

### 👥 团队协作优势
- **权限管理**：通过 GitHub 仓库权限控制部署权限
- **代码审查**：所有更改通过 PR 进行 Code Review
- **协作友好**：团队成员无需共享 Vercel 账户
- **透明化**：所有部署历史在 GitHub 和 Vercel 中可见

### 🛡️ 运维安全优势
- **自动化部署**：减少人为部署错误
- **快速回滚**：Git revert 即可快速回滚服务
- **环境隔离**：开发/预览/生产环境完全隔离
- **CI/CD集成**：可集成自动化测试和质量检查

## 📁 GitHub 仓库结构

```
chengshang-update-server/           # GitHub 仓库名
├── api/                           # Vercel Serverless API
│   ├── releases.js               # 更新检查和版本管理API
│   └── health.js                 # 健康检查API
├── .github/                      # GitHub 工作流
│   └── workflows/
│       └── deploy.yml           # 自动部署配置
├── package.json                  # 项目依赖配置
├── vercel.json                  # Vercel 部署配置
├── .gitignore                   # Git 忽略文件
├── index.html                   # 服务状态页面
└── README.md                    # 项目说明文档
```

## 🚀 部署步骤

### 第一步：创建 GitHub 仓库

#### 1.1 在 GitHub 创建新仓库
1. 访问 [GitHub](https://github.com) 并登录
2. 点击右上角 "+" → "New repository"
3. 仓库名称：`chengshang-update-server`
4. 选择 "Public" 或 "Private"（推荐 Private）
5. 勾选 "Add a README file"
6. 点击 "Create repository"

#### 1.2 克隆仓库到本地
```bash
git clone https://github.com/your-username/chengshang-update-server.git
cd chengshang-update-server
```

#### 1.3 复制项目文件
```bash
# 将 vercel-update-server 目录下的所有文件复制到仓库根目录
cp -r path/to/vercel-update-server/* ./

# 或者手动复制以下文件：
# - api/ 目录及其内容
# - package.json
# - vercel.json  
# - index.html
# - .gitignore
# - .github/ 目录及其内容
```

### 第二步：连接 Vercel

#### 2.1 登录 Vercel Dashboard
1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 使用 GitHub 账户登录（推荐）

#### 2.2 导入 GitHub 仓库
1. 点击 "New Project" 按钮
2. 在 "Import Git Repository" 部分找到你的仓库
3. 点击仓库右侧的 "Import" 按钮
4. 项目配置：
   - **Framework Preset**: Other
   - **Root Directory**: `./` (默认)
   - **Build Command**: 留空
   - **Output Directory**: 留空
   - **Install Command**: `npm install`

#### 2.3 配置环境变量
在部署前，点击 "Environment Variables" 展开：

```bash
# 管理员访问令牌（必需）
Name: ADMIN_TOKEN
Value: your-super-secret-admin-token-here-make-it-strong

# API 加密密钥（可选）  
Name: ENCRYPTION_KEY
Value: your-encryption-key-for-additional-security
```

**生成强密码示例：**
```bash
# 使用 OpenSSL 生成随机token
openssl rand -base64 32

# 或使用在线工具
# https://www.uuidgenerator.net/
```

#### 2.4 完成部署
1. 点击 "Deploy" 按钮
2. 等待部署完成（通常1-2分钟）
3. 获得部署地址：`https://your-app.vercel.app`

### 第三步：推送代码并测试

#### 3.1 推送初始代码
```bash
# 添加所有文件到Git
git add .

# 提交更改
git commit -m "feat: 初始化自动更新服务器"

# 推送到GitHub
git push origin main
```

#### 3.2 验证自动部署
1. 推送后，Vercel 会自动检测到更改
2. 访问 Vercel Dashboard 查看部署状态
3. 部署成功后，访问你的服务地址

#### 3.3 测试 API 接口
```bash
# 健康检查
curl https://your-app.vercel.app/health

# 更新检查测试
curl https://your-app.vercel.app/api/releases/windows-x86_64/1.0.0
```

### 第四步：更新 Tauri 配置

编辑主项目的 `src-tauri/tauri.conf.json`：

```json
{
  "plugins": {
    "updater": {
      "endpoints": [
        "https://your-app.vercel.app/api/releases/{{target}}/{{current_version}}"
      ],
      "dialog": true,
      "pubkey": "你的数字签名公钥"
    }
  }
}
```

## 🔧 自定义域名配置（可选）

### 4.1 在 Vercel 配置自定义域名
1. 进入 Vercel 项目 → Settings → Domains
2. 添加域名：`api.chengshangcehua.com`
3. 按照提示配置 DNS 记录

### 4.2 DNS 配置
```bash
# 添加 CNAME 记录
类型: CNAME
名称: api
值: cname.vercel-dns.com.
TTL: 自动或300
```

### 4.3 更新 Tauri 配置
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

## 🔄 日常开发工作流

### 功能开发流程
```bash
# 1. 创建功能分支
git checkout -b feature/add-rollback-api

# 2. 进行开发工作
# 编辑 api/releases.js 等文件

# 3. 本地测试（可选）
npx vercel dev

# 4. 提交更改
git add .
git commit -m "feat: 添加版本回滚API"

# 5. 推送分支
git push origin feature/add-rollback-api

# 6. 创建 Pull Request
# 在 GitHub 上创建 PR，Vercel 会自动生成预览部署

# 7. 代码审查通过后，合并到 main
# 合并后自动部署到生产环境
```

### 版本发布流程
```bash
# 1. 构建新版本的桌面应用
npm run tauri build

# 2. 上传安装包到 GitHub Releases
git tag v1.1.0
git push origin v1.1.0
# 在 GitHub 创建 Release 并上传安装包

# 3. 更新服务器版本信息
curl -X POST https://your-app.vercel.app/api/releases \
  -H "Authorization: Bearer your-admin-token" \
  -H "Content-Type: application/json" \
  -d '{
    "target": "windows-x86_64",
    "version": "1.1.0",
    "notes": "• 修复了工具启动问题\n• 优化了性能表现",
    "signature": "生成的数字签名",
    "url": "https://github.com/your-org/releases/download/v1.1.0/setup.exe"
  }'
```

### 紧急回滚流程
```bash
# 1. 回滚到上一个稳定版本
git revert HEAD
git push origin main

# 2. Vercel 会自动部署回滚版本
# 3. 服务在几分钟内恢复正常
```

## 📊 监控和运维

### 部署监控
- **Vercel Dashboard**: 查看部署状态和日志
- **GitHub Actions**: 监控 CI/CD 流水线状态
- **实时日志**: `vercel logs --follow`（需要CLI）

### 性能监控
- **响应时间**: Vercel 自动监控 API 响应时间
- **错误率**: 实时追踪 5xx 错误和异常
- **流量统计**: 请求量和带宽使用情况

### 告警配置
```bash
# 在 Vercel Dashboard 中配置：
# 1. Integrations → 选择通知方式（Slack/Email等）
# 2. 设置告警阈值（错误率、响应时间等）
# 3. 配置告警接收人
```

## 🔐 安全最佳实践

### 环境变量安全
- ✅ 使用强随机字符串作为 `ADMIN_TOKEN`
- ✅ 定期轮换访问令牌（建议每3个月）
- ✅ 不要在代码中硬编码敏感信息
- ✅ 使用 Vercel 环境变量管理敏感配置

### API 接口安全
- ✅ 实施请求频率限制
- ✅ 验证所有输入参数
- ✅ 记录管理员操作日志
- ✅ 启用 HTTPS 强制重定向

### GitHub 仓库安全
- ✅ 设置仓库为私有（推荐）
- ✅ 启用分支保护规则
- ✅ 要求 PR 审查后才能合并
- ✅ 启用 Dependabot 安全更新

## 🎭 进阶功能扩展

### 1. 集成数据库存储
```javascript
// 使用 Vercel KV 或 PlanetScale
import { kv } from '@vercel/kv';

async function getReleases(target) {
  return await kv.get(`releases:${target}`);
}
```

### 2. 添加 Webhook 通知
```javascript
// 版本发布时通知团队
async function notifyTeam(version) {
  await fetch(process.env.WEBHOOK_URL, {
    method: 'POST',
    body: JSON.stringify({
      text: `🚀 新版本 ${version} 已发布！`
    })
  });
}
```

### 3. 实现灰度发布
```javascript
// 按百分比控制更新推送
function shouldGetUpdate(userAgent, rolloutPercent = 50) {
  const hash = crypto.createHash('md5').update(userAgent).digest('hex');
  return parseInt(hash.substring(0, 2), 16) < (rolloutPercent * 2.55);
}
```

## 🚨 故障排除

### 常见问题解决

**1. 部署失败**
```bash
# 检查 GitHub Actions 日志
# 查看 Vercel Dashboard 中的 Functions 日志
# 确认 package.json 和 vercel.json 配置正确
```

**2. API 返回 500 错误**
```bash
# 检查环境变量是否正确设置
# 查看 Vercel Functions 实时日志
# 确认 API 代码语法无误
```

**3. 自动部署不触发**
```bash
# 确认 GitHub 仓库与 Vercel 项目连接正常
# 检查 main 分支是否是默认部署分支
# 查看 Vercel Dashboard 中的 Git Integration 设置
```

### 调试工具

**本地开发调试：**
```bash
# 安装 Vercel CLI（可选）
npm install -g vercel

# 本地运行服务
vercel dev

# 访问本地API
curl http://localhost:3000/health
```

**生产环境调试：**
```bash
# 查看实时日志
vercel logs --follow

# 查看特定函数日志
vercel logs api/releases.js
```

## 📈 成本分析

### Vercel 免费额度（足够大部分应用）
- **函数执行时间**: 100 GB-小时/月
- **带宽**: 100 GB/月
- **函数调用**: 无限制
- **部署**: 无限制

### 预估使用量
- **更新检查请求**: 假设1000用户，每天检查2次 = 60K次/月
- **带宽消耗**: 每次响应约1KB = 60MB/月
- **函数执行时间**: 每次50ms = 0.83小时/月

**结论**: 免费额度完全够用，预计成本为 $0/月 💰

## 🎉 部署完成检查清单

完成以下检查项，确保部署成功：

### 基础功能检查
- [ ] GitHub 仓库创建并推送代码
- [ ] Vercel 项目成功连接 GitHub 仓库
- [ ] 环境变量 `ADMIN_TOKEN` 配置正确
- [ ] 自动部署触发并成功完成
- [ ] API 健康检查返回正常：`/health`
- [ ] 更新检查 API 响应正常：`/api/releases/{target}/{version}`

### 安全配置检查
- [ ] 管理员 Token 使用强密码
- [ ] GitHub 仓库权限设置合理
- [ ] Vercel 环境变量安全存储
- [ ] API 接口访问日志正常

### 集成测试检查
- [ ] Tauri 应用配置更新服务器地址
- [ ] 数字签名公钥配置正确
- [ ] 自动更新功能端到端测试通过
- [ ] 版本发布流程验证完成

### 监控配置检查
- [ ] Vercel Dashboard 监控正常
- [ ] 部署通知配置（可选）
- [ ] 错误告警设置（可选）
- [ ] 性能监控指标正常

## 🎯 下一步行动

1. **立即部署**: 按照本指南完成首次部署
2. **功能测试**: 验证所有 API 接口正常工作
3. **集成应用**: 更新 Tauri 应用配置
4. **版本发布**: 准备第一个正式版本
5. **监控优化**: 设置性能监控和告警

---

**恭喜！你现在拥有了一个完全自动化、高可用、零成本的企业级自动更新服务器！** 🚀

通过 GitHub + Vercel 的组合，你获得了：
- ✅ **专业的 Git 工作流**
- ✅ **团队协作友好**  
- ✅ **零运维成本**
- ✅ **全球CDN加速**
- ✅ **企业级可靠性**

现在开始享受 `git push` 即可部署生产环境的便利吧！