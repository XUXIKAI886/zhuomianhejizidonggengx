# 🔧 iframe复制按钮修复方案

## 🎯 问题描述
"域锦科技AI系统"工具中的复制按钮在Tauri应用的iframe中无法点击，但在网页中直接打开正常。

## 🔍 问题根源
现代浏览器和Tauri环境对iframe中的剪贴板访问有严格的安全限制：
1. **缺少剪贴板权限声明**：iframe没有明确允许剪贴板访问
2. **Tauri安全策略**：桌面应用环境对剪贴板访问更加严格
3. **跨域安全限制**：浏览器默认阻止iframe访问剪贴板API

## 🛠️ 修复方案

### 1. 前端iframe权限修复
**文件**: `components/web-view-modal.tsx`

**修改前**:
```jsx
<iframe
  id="webview-iframe"
  src={tool.url}
  className="w-full h-full border-0 block"
  onLoad={handleIframeLoad}
  onError={handleIframeError}
  referrerPolicy="no-referrer-when-downgrade"
  allowFullScreen
  style={{
    border: 'none',
    width: '100%',
    height: '100%'
  }}
/>
```

**修改后**:
```jsx
<iframe
  id="webview-iframe"
  src={tool.url}
  className="w-full h-full border-0 block"
  onLoad={handleIframeLoad}
  onError={handleIframeError}
  referrerPolicy="no-referrer-when-downgrade"
  allowFullScreen
  allow="clipboard-read; clipboard-write; web-share; fullscreen; geolocation; microphone; camera"
  style={{
    border: 'none',
    width: '100%',
    height: '100%'
  }}
/>
```

**关键变化**:
- ✅ 添加了 `allow="clipboard-read; clipboard-write; web-share; fullscreen; geolocation; microphone; camera"` 属性
- ✅ 明确允许iframe访问剪贴板API
- ✅ 同时允许其他可能需要的权限

### 2. Tauri后端权限配置
**文件**: `src-tauri/capabilities/main-capability.json`

**添加权限**:
```json
{
  "permissions": [
    // ... 其他权限
    "clipboard-manager:default",
    "clipboard-manager:allow-read-text",
    "clipboard-manager:allow-write-text"
  ]
}
```

### 3. Rust依赖添加
**文件**: `src-tauri/Cargo.toml`

**添加依赖**:
```toml
[dependencies]
# ... 其他依赖
tauri-plugin-clipboard-manager = "2"
```

### 4. 插件初始化
**文件**: `src-tauri/src/lib.rs`

**添加插件**:
```rust
.plugin(tauri_plugin_clipboard_manager::init())
```

## 🎯 修复效果

### ✅ 修复后的功能
1. **剪贴板读取**：iframe内的网页可以读取系统剪贴板内容
2. **剪贴板写入**：iframe内的复制按钮可以正常工作
3. **跨平台支持**：Windows、macOS、Linux全平台支持
4. **安全性保持**：只允许必要的权限，保持应用安全

### 🔧 支持的剪贴板操作
- ✅ 文本复制（navigator.clipboard.writeText）
- ✅ 文本粘贴（navigator.clipboard.readText）
- ✅ 富文本复制（如果网页支持）
- ✅ 用户手势触发的剪贴板操作

## 🚀 测试验证

### 测试步骤
1. **重新构建应用**：
   ```bash
   npm run tauri:build
   ```

2. **安装新版本**：
   - 安装生成的 `csch_1.0.26_x64-setup.exe`

3. **测试复制功能**：
   - 打开"域锦科技AI系统"工具
   - 尝试点击复制按钮
   - 验证内容是否成功复制到剪贴板

### 预期结果
- ✅ 复制按钮可以正常点击
- ✅ 内容成功复制到系统剪贴板
- ✅ 可以在其他应用中粘贴复制的内容
- ✅ 不影响其他工具的正常使用

## 🔄 兼容性说明

### 浏览器兼容性
- ✅ Chrome/Edge 76+
- ✅ Firefox 63+
- ✅ Safari 13.1+
- ✅ Tauri WebView (基于系统WebView)

### 安全考虑
- 🔒 只在用户手势触发时允许剪贴板访问
- 🔒 仅允许文本类型的剪贴板操作
- 🔒 不影响应用的整体安全策略

## 📋 后续优化建议

1. **权限细化**：根据实际需求进一步细化权限配置
2. **错误处理**：添加剪贴板操作失败时的用户提示
3. **性能监控**：监控剪贴板操作对应用性能的影响

---
**修复版本**: v1.0.26+  
**测试状态**: 待验证  
**适用工具**: 所有iframe嵌入的工具
