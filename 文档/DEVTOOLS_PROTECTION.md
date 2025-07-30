# 开发者工具保护机制

## 🔒 保护功能概述

为了保护应用的源代码和防止用户进行不当操作，我们实现了多层次的开发者工具保护机制。

## 🛡️ 保护层级

### 1. Tauri 配置层保护
**文件**: `src-tauri/tauri.conf.json`
```json
{
  "app": {
    "windows": [
      {
        "devtools": false
      }
    ]
  }
}
```
- 在Tauri应用层面禁用开发者工具
- 这是最底层的保护，防止WebView打开开发者工具

### 2. JavaScript 事件拦截
**文件**: `components/dev-tools-blocker.tsx`

#### 禁用的快捷键
- **F12** - 开发者工具
- **Ctrl+Shift+I** - 开发者工具
- **Ctrl+Shift+J** - 控制台
- **Ctrl+U** - 查看源代码
- **Ctrl+Shift+C** - 选择元素
- **Ctrl+S** - 保存页面
- **Ctrl+A** - 全选
- **Ctrl+P** - 打印

#### 禁用的操作
- **右键菜单** - 防止"检查元素"
- **文本选择** - 防止复制代码
- **拖拽操作** - 防止拖拽文件

#### 检测机制
- **窗口尺寸检测** - 检测开发者工具是否打开
- **控制台清理** - 定期清空控制台内容

### 3. CSS 样式保护
**文件**: `app/globals.css`

```css
/* 禁用文本选择 */
* {
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

/* 禁用右键菜单 */
body {
  -webkit-context-menu: none;
  -moz-context-menu: none;
  context-menu: none;
}

/* 禁用拖拽 */
* {
  -webkit-user-drag: none;
  -moz-user-drag: none;
  user-drag: none;
}
```

## 🎯 保护效果

### ✅ 已禁用的功能
1. **F12键** - 无法打开开发者工具
2. **右键菜单** - 无法访问"检查元素"
3. **快捷键组合** - 所有开发者工具相关快捷键被拦截
4. **文本选择** - 无法选择和复制页面文本
5. **页面保存** - 无法通过Ctrl+S保存页面
6. **源代码查看** - 无法通过Ctrl+U查看源代码
7. **拖拽操作** - 防止拖拽文件到页面

### ⚠️ 例外情况
- **输入框** - 仍然可以选择和编辑文本
- **开发环境** - 在开发模式下可能部分功能仍可用

## 🔧 技术实现

### 事件拦截机制
```typescript
const disableDevToolsKeys = (e: KeyboardEvent) => {
  if (e.key === 'F12') {
    e.preventDefault()
    return false
  }
  // ... 其他快捷键
}

document.addEventListener('keydown', disableDevToolsKeys)
```

### 右键菜单禁用
```typescript
const disableContextMenu = (e: MouseEvent) => {
  e.preventDefault()
  return false
}

document.addEventListener('contextmenu', disableContextMenu)
```

### 开发者工具检测
```typescript
const detectDevTools = () => {
  const threshold = 160
  setInterval(() => {
    if (
      window.outerHeight - window.innerHeight > threshold ||
      window.outerWidth - window.innerWidth > threshold
    ) {
      console.clear() // 清空控制台
    }
  }, 500)
}
```

## 📝 使用说明

### 开发环境
在开发环境中，这些保护机制可能会影响开发体验。如需临时禁用：

1. **注释掉DevToolsBlocker组件**
```tsx
// <DevToolsBlocker />
```

2. **修改Tauri配置**
```json
"devtools": true
```

### 生产环境
在生产构建中，所有保护机制都会生效，确保应用安全。

## 🚨 安全注意事项

### 保护限制
- 这些保护主要针对普通用户
- 有经验的开发者仍可能找到绕过方法
- 不应作为唯一的安全措施

### 建议补充措施
1. **代码混淆** - 在构建时混淆JavaScript代码
2. **服务端验证** - 重要操作在服务端验证
3. **加密通信** - 使用HTTPS和其他加密措施
4. **访问控制** - 实现用户权限管理

## 🔄 维护和更新

### 定期检查
- 测试保护机制是否有效
- 更新可能的绕过方法
- 关注新的浏览器安全特性

### 性能考虑
- 事件监听器可能影响性能
- 定期清理控制台会消耗资源
- 在必要时可以调整检测频率

---

**注意**: 这些保护措施主要用于防止普通用户的误操作和基本的代码保护，不能替代完整的安全策略。
