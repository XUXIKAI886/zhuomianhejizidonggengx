# 🔐 Token认证功能使用指南

## 📋 功能概述

v1.0.18版本新增了完整的"记住我"和"自动登录"功能，提供企业级的用户体验：

- **记住我功能** - 在设备上保持登录状态30天
- **自动登录功能** - 应用启动时自动登录7天
- **安全Token管理** - JWT Token + MongoDB存储
- **跨设备同步** - 登出时清除所有设备Token

## 🚀 功能特性

### ✅ 已实现功能

1. **JWT Token生成和验证**
   - 使用jsonwebtoken库生成安全Token
   - 包含用户信息、角色、过期时间等Claims
   - 支持Token类型区分（remember_me/auto_login）

2. **MongoDB Token管理**
   - user_tokens集合存储Token信息
   - 支持Token过期时间管理
   - 登录时自动清除旧Token

3. **本地存储集成**
   - localStorage安全存储Token
   - 应用启动时自动检查Token
   - 登出时清除本地Token

4. **智能会话恢复**
   - 优先检查当前会话
   - 自动尝试auto_login Token
   - 备用尝试remember_me Token

## 🔧 技术实现

### 后端实现 (Rust)

```rust
// Token数据结构
pub struct UserToken {
    pub user_id: ObjectId,
    pub token: String,
    pub token_type: String, // "remember_me" | "auto_login"
    pub created_at: DateTime,
    pub expires_at: DateTime,
    pub is_active: bool,
}

// JWT Claims
pub struct TokenClaims {
    pub sub: String,      // 用户ID
    pub username: String,
    pub role: String,
    pub token_type: String,
    pub exp: i64,         // 过期时间
    pub iat: i64,         // 签发时间
}
```

### 前端实现 (TypeScript)

```typescript
// Token存储管理
const REMEMBER_ME_TOKEN_KEY = 'chengshang_remember_me_token'
const AUTO_LOGIN_TOKEN_KEY = 'chengshang_auto_login_token'

// 登录时保存Token
if (rememberMe && loginResponse.rememberMeToken) {
  localStorage.setItem(REMEMBER_ME_TOKEN_KEY, loginResponse.rememberMeToken)
}

// 应用启动时检查Token
const autoLoginToken = localStorage.getItem(AUTO_LOGIN_TOKEN_KEY)
if (autoLoginToken) {
  const user = await apiCall('verify_token_and_login', {
    token: autoLoginToken,
    tokenType: 'auto_login'
  })
}
```

## 📱 用户使用指南

### 1. 启用记住我功能

1. 在登录页面输入用户名和密码
2. 勾选"记住我"复选框
3. 点击登录按钮
4. 系统会生成30天有效期的Token
5. 下次访问时无需重新登录

### 2. 启用自动登录功能

1. 在登录页面勾选"自动登录"复选框
2. 登录成功后，系统生成7天有效期的Token
3. 应用启动时自动验证Token并登录
4. 适合频繁使用的用户

### 3. 安全登出

1. 点击用户头像下拉菜单中的"退出登录"
2. 系统会清除所有设备上的Token
3. 确保账户安全

## 🔒 安全特性

### Token安全设计

1. **JWT签名验证** - 使用密钥签名，防止伪造
2. **过期时间控制** - 记住我30天，自动登录7天
3. **数据库验证** - Token必须在数据库中存在且有效
4. **自动清理** - 登录时清除旧Token，登出时清除所有Token

### 数据保护

1. **本地存储加密** - Token存储在localStorage中
2. **跨设备同步** - 登出时清除所有设备Token
3. **用户状态检查** - 验证用户是否仍然活跃
4. **会话记录** - 完整的登录会话审计

## 🧪 测试验证

### 运行测试脚本

```bash
# 测试Token认证功能
node scripts/test-token-auth.js
```

### 手动测试步骤

1. **记住我测试**
   ```
   1. 登录时勾选"记住我"
   2. 关闭浏览器/应用
   3. 重新打开，应该自动登录
   4. 检查localStorage中的Token
   ```

2. **自动登录测试**
   ```
   1. 登录时勾选"自动登录"
   2. 重启应用
   3. 应该在启动时自动登录
   4. 验证会话状态
   ```

3. **安全登出测试**
   ```
   1. 正常登出
   2. 检查localStorage已清空
   3. 重新打开应用需要重新登录
   4. 验证数据库Token已删除
   ```

## 🔧 故障排除

### 常见问题

**Q: Token验证失败**
```
检查项目：
1. 系统时间是否正确
2. Token是否已过期
3. 数据库连接是否正常
4. JWT密钥是否一致
```

**Q: 自动登录不工作**
```
检查项目：
1. localStorage中是否有Token
2. Token类型是否正确
3. 用户账户是否仍然活跃
4. 网络连接是否正常
```

**Q: 记住我功能失效**
```
检查项目：
1. 浏览器是否清除了localStorage
2. Token是否超过30天有效期
3. 用户是否在其他设备登出
4. 数据库Token记录是否存在
```

## 📊 监控和维护

### Token使用统计

```javascript
// 查看Token使用情况
db.user_tokens.aggregate([
  {
    $group: {
      _id: "$tokenType",
      count: { $sum: 1 },
      active: { 
        $sum: { 
          $cond: [
            { $and: [
              { $eq: ["$isActive", true] },
              { $gt: ["$expiresAt", new Date()] }
            ]},
            1, 0
          ]
        }
      }
    }
  }
])
```

### 定期清理过期Token

```javascript
// 清理过期Token
db.user_tokens.deleteMany({
  $or: [
    { isActive: false },
    { expiresAt: { $lt: new Date() } }
  ]
})
```

## 🎯 最佳实践

1. **用户教育** - 告知用户记住我和自动登录的区别
2. **安全提醒** - 在公共设备上不要使用记住我功能
3. **定期清理** - 定期清理过期Token保持数据库整洁
4. **监控异常** - 监控Token验证失败的情况
5. **备份策略** - 确保Token数据的备份和恢复

---

**版本**: v1.0.18  
**更新时间**: 2025年8月1日  
**维护者**: 呈尚策划技术团队
