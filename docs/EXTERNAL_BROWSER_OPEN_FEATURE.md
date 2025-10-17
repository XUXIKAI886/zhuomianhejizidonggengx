# 外部浏览器打开功能说明

## 📋 功能概述

实现了根据工具类型 (`toolType`) 自动选择打开方式：
- `toolType: "web"` - 在 Tauri 应用内的 WebView 中打开
- `toolType: "external"` - 在系统默认浏览器中打开
- `toolType: "desktop"` - 桌面应用类型（保留）

## 🎯 适用场景

### 使用外部浏览器 (`external`) 的情况

**适用于需要以下功能的工具**：
1. ✅ 文件上传/下载 - 需要浏览器原生文件API
2. ✅ 跨域资源访问 - 避免Tauri的跨域限制
3. ✅ 浏览器插件依赖 - 需要使用浏览器扩展
4. ✅ 复杂的JavaScript功能 - 可能与Tauri环境不兼容
5. ✅ 第三方认证集成 - OAuth、社交登录等

**典型工具示例**：
- 外卖图片系统 (需要本地文件选择和图片下载)
- 外卖数周报系统 (可能需要导出功能)

### 使用应用内WebView (`web`) 的情况

**适用于以下类型的工具**：
1. ✅ 纯展示型工具 - 运营手册、知识库
2. ✅ 数据可视化 - 图表展示、数据分析
3. ✅ 简单交互工具 - 计算器、统计工具
4. ✅ 内部管理系统 - 已集成认证的内部工具

**优点**：
- 统一的用户体验
- 无需切换窗口
- 可以共享应用认证状态

## 🔧 实现细节

### 1. 工具数据配置

在 `lib/tool-data.ts` 中标记工具类型：

```typescript
{
  id: 33,
  name: "外卖图片系统",
  description: "外卖头像、店招、海报图片提取和处理工具",
  category: "美工工具",
  url: "https://xuxikai886.github.io/touxiangdianzhaohaibaotiqu/",
  icon: Image,
  toolType: "external"  // ← 标记为外部打开
}
```

### 2. 点击处理逻辑

在 `components/tool-grid.tsx` 中的 `handleLaunchTool` 函数：

```typescript
const handleLaunchTool = async (tool) => {
  // ... 统计记录代码 ...

  if (tool.toolType === 'external') {
    // 在外部浏览器中打开
    if (typeof window.__TAURI__ !== 'undefined') {
      // Tauri环境 - 使用shell插件
      await window.__TAURI__.core.invoke('plugin:shell|open', {
        path: tool.url
      })
    } else {
      // Web环境 - 使用window.open
      window.open(tool.url, '_blank')
    }
  } else {
    // 在应用内WebView中打开
    setWebViewModal({
      isOpen: true,
      tool: tool
    })
  }
}
```

### 3. Tauri权限配置

在 `src-tauri/capabilities/main-capability.json` 中配置shell权限：

```json
{
  "identifier": "shell:allow-open",
  "allow": [
    {
      "name": "open",
      "cmd": {
        "args": [
          { "validator": "https://xuxikai886.github.io/**" },
          { "validator": "https://www.yujinkeji.xyz/**" },
          { "validator": "https://**" },
          { "validator": "http://**" }
        ]
      }
    }
  ]
}
```

## 📊 当前配置的外部工具

| 工具ID | 工具名称 | URL | 原因 |
|--------|---------|-----|------|
| 33 | 外卖图片系统 | https://xuxikai886.github.io/touxiangdianzhaohaibaotiqu/ | 需要文件选择和下载功能 |
| 23 | 外卖数周报系统 | https://www.csch.asia/ | 可能需要导出功能 |

## 🧪 测试步骤

### 测试外部浏览器打开

1. **启动开发服务器**：
   ```bash
   npm run tauri:dev
   ```

2. **找到标记为 `external` 的工具**：
   - 进入"美工工具"分类
   - 找到"外卖图片系统"

3. **点击"打开工具"按钮**：
   - ✅ 应该在系统默认浏览器中打开（Chrome/Edge/Firefox等）
   - ✅ 不应该在Tauri应用内的WebView中打开

4. **验证功能**：
   - ✅ 在浏览器中可以正常选择文件
   - ✅ 在浏览器中可以正常下载图片
   - ✅ 所有功能正常工作

### 测试应用内WebView

1. **找到标记为 `web` 的工具**：
   - 进入"运营工具"分类
   - 找到"商家回复解答手册"

2. **点击"打开工具"按钮**：
   - ✅ 应该在Tauri应用内的WebView模态框中打开
   - ✅ 不应该打开浏览器

## 🔄 添加新的外部工具

如果需要将其他工具也设置为外部打开：

### 步骤1: 修改工具数据

```typescript
// lib/tool-data.ts
{
  id: XX,
  name: "工具名称",
  // ... 其他配置 ...
  toolType: "external"  // 改为 external
}
```

### 步骤2: 添加权限（如果是新域名）

```json
// src-tauri/capabilities/main-capability.json
{
  "validator": "https://新域名.com/**"
}
```

### 步骤3: 重启开发服务器

```bash
# 停止当前服务器 (Ctrl+C)
npm run tauri:dev
```

### 步骤4: 测试验证

按照上述测试步骤验证功能。

## 🐛 常见问题

### Q1: 点击工具后没有反应

**检查项**：
1. 检查控制台日志，查看 `工具类型:` 输出
2. 确认 `toolType` 设置正确
3. 检查Tauri权限配置中是否包含该URL

**解决方案**：
```bash
# 查看控制台输出
# 应该看到: 🌐 [前端] 在外部浏览器中打开: https://...
```

### Q2: 权限错误

**错误信息**：
```
shell:allow-open permission denied
```

**解决方案**：
1. 检查 `main-capability.json` 中的 `shell:allow-open` 配置
2. 确保URL匹配 validator 模式
3. 重启Tauri开发服务器

### Q3: 在Web环境中无法打开

**现象**: 在 `npm run dev` (非Tauri) 中点击无反应

**原因**: Web环境使用 `window.open`，可能被浏览器阻止弹窗

**解决方案**:
- 允许浏览器弹出窗口
- 或者在Tauri环境中测试（推荐）

## 📝 最佳实践

### 何时使用 `external`

```typescript
// ✅ 推荐使用 external
toolType: "external"  // 当工具包含以下功能时
```

**标准**：
- ✅ 需要文件上传/下载
- ✅ 使用 `<input type="file">`
- ✅ 使用 `fetch()` 访问跨域资源
- ✅ 依赖浏览器特定API
- ✅ 需要OAuth认证

### 何时使用 `web`

```typescript
// ✅ 推荐使用 web
toolType: "web"  // 当工具是以下类型时
```

**标准**：
- ✅ 纯展示内容（手册、文档）
- ✅ 数据可视化（图表、统计）
- ✅ 简单计算器/工具
- ✅ 不需要文件操作
- ✅ 不需要跨域请求

## 🔐 安全考虑

### URL白名单

当前配置允许打开所有 `https://` 和 `http://` 链接。在生产环境中，建议：

1. **仅允许特定域名**：
   ```json
   {
     "validator": "https://xuxikai886.github.io/**"
   }
   ```

2. **避免通配符**：
   ```json
   // ❌ 不推荐
   { "validator": "https://**" }

   // ✅ 推荐
   { "validator": "https://trusted-domain.com/**" }
   ```

3. **定期审查**：
   - 检查配置的URL列表
   - 移除不再使用的权限
   - 确保只有可信来源

## 📚 相关文档

- [Tauri Shell Plugin](https://v2.tauri.app/plugin/shell/)
- [Tauri Capabilities](https://v2.tauri.app/learn/security/capabilities/)
- [工具数据配置](../lib/tool-data.ts)
- [工具网格组件](../components/tool-grid.tsx)

---

**创建日期**: 2025年10月16日
**版本**: v1.0.26+
**状态**: ✅ 已实现并测试
