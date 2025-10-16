# Tauri文件选择对话框使用指南

## 问题背景

在Tauri桌面应用中，HTML的 `<input type="file">` 元素默认无法正常工作。这是因为Tauri的安全模型限制了Web视图对本地文件系统的直接访问。

**症状**：
- 点击文件选择按钮没有反应
- 无法打开文件选择对话框
- 在网页环境中正常，在Tauri桌面应用中失效

## 解决方案

使用Tauri提供的 `@tauri-apps/plugin-dialog` 插件来调用系统原生文件对话框。

### 1. 后端配置（已完成）

#### 安装Rust依赖
```bash
cd src-tauri
cargo add tauri-plugin-dialog
```

#### 初始化插件 (src-tauri/src/lib.rs)
```rust
pub fn run() {
  tauri::Builder::default()
    // ... 其他插件
    .plugin(tauri_plugin_dialog::init())  // ✅ 已添加
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
```

### 2. 前端配置（需要更新）

#### 安装npm包
```bash
npm install @tauri-apps/plugin-dialog --legacy-peer-deps
```
✅ 已安装完成

#### 在工具代码中使用

**错误做法**（不工作）：
```html
<!-- ❌ 在Tauri中不工作 -->
<input type="file" id="fileInput" />
<button onclick="document.getElementById('fileInput').click()">选择文件</button>
```

**正确做法**（使用Tauri Dialog API）：

```javascript
// 引入dialog插件
import { open } from '@tauri-apps/plugin-dialog';

// 选择单个文件
async function selectFile() {
  const selected = await open({
    multiple: false,
    directory: false,
    filters: [{
      name: 'Images',
      extensions: ['png', 'jpg', 'jpeg', 'gif', 'webp']
    }]
  });

  if (selected) {
    console.log('选中的文件路径:', selected);
    // selected 是文件的完整路径字符串
  }
}

// 选择多个文件
async function selectMultipleFiles() {
  const selected = await open({
    multiple: true,
    directory: false
  });

  if (selected) {
    console.log('选中的文件:', selected);
    // selected 是文件路径数组
  }
}

// 选择文件夹
async function selectDirectory() {
  const selected = await open({
    directory: true,
    multiple: false
  });

  if (selected) {
    console.log('选中的文件夹:', selected);
  }
}

// 文件保存对话框
import { save } from '@tauri-apps/plugin-dialog';

async function saveFile() {
  const filePath = await save({
    filters: [{
      name: 'Excel',
      extensions: ['xlsx', 'xls']
    }]
  });

  if (filePath) {
    console.log('保存路径:', filePath);
  }
}
```

### 3. 针对"外卖图片系统"的修改建议

如果"外卖图片系统"工具的源码可以修改，建议：

1. **检测Tauri环境**：
```javascript
// 检查是否在Tauri环境中运行
const isTauri = window.__TAURI__ !== undefined;
```

2. **使用条件逻辑**：
```javascript
async function selectMonitorFile() {
  if (isTauri) {
    // 在Tauri环境中使用dialog插件
    const { open } = await import('@tauri-apps/plugin-dialog');
    const file = await open({
      directory: false,
      multiple: false
    });
    return file;
  } else {
    // 在网页环境中使用HTML input
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.onchange = (e) => resolve(e.target.files[0]);
      input.click();
    });
  }
}
```

### 4. Dialog API完整参数

#### `open()` - 打开文件/文件夹对话框

```typescript
interface OpenDialogOptions {
  multiple?: boolean;       // 是否可以选择多个文件（默认false）
  directory?: boolean;      // 是否选择文件夹（默认false）
  defaultPath?: string;     // 默认打开路径
  filters?: FileFilter[];   // 文件类型过滤器
  title?: string;           // 对话框标题
}

interface FileFilter {
  name: string;             // 过滤器名称（如 "Images"）
  extensions: string[];     // 允许的扩展名（如 ['png', 'jpg']）
}
```

#### `save()` - 保存文件对话框

```typescript
interface SaveDialogOptions {
  defaultPath?: string;     // 默认保存路径和文件名
  filters?: FileFilter[];   // 文件类型过滤器
  title?: string;           // 对话框标题
}
```

### 5. 常见文件类型过滤器示例

```javascript
// 图片文件
filters: [{
  name: 'Images',
  extensions: ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg']
}]

// Excel文件
filters: [{
  name: 'Excel',
  extensions: ['xlsx', 'xls', 'csv']
}]

// 文本文件
filters: [{
  name: 'Text',
  extensions: ['txt', 'md', 'json']
}]

// 所有文件
filters: [{
  name: 'All Files',
  extensions: ['*']
}]

// 多种类型
filters: [
  { name: 'Images', extensions: ['png', 'jpg'] },
  { name: 'Excel', extensions: ['xlsx', 'xls'] },
  { name: 'All Files', extensions: ['*'] }
]
```

### 6. 错误处理

```javascript
async function selectFileWithErrorHandling() {
  try {
    const { open } = await import('@tauri-apps/plugin-dialog');

    const selected = await open({
      multiple: false,
      directory: false
    });

    if (selected === null) {
      console.log('用户取消了选择');
      return null;
    }

    return selected;
  } catch (error) {
    console.error('文件选择失败:', error);
    alert('文件选择失败，请重试');
    return null;
  }
}
```

### 7. 权限说明

Tauri的dialog插件默认已启用所有权限，包括：
- `allow-ask` - 显示确认对话框
- `allow-confirm` - 显示确认对话框
- `allow-message` - 显示消息对话框
- `allow-save` - 保存文件对话框
- `allow-open` - 打开文件/文件夹对话框

这些权限已在 `src-tauri/capabilities/main-capability.json` 中自动配置。

## 对外部工具的兼容性

如果"外卖图片系统"是一个外部托管的网页工具（如 https://xuxikai886.github.io/），有两种解决方案：

### 方案A：修改工具源码（推荐）
在工具源码中添加Tauri检测和兼容代码（见上文第3节）。

### 方案B：使用代理注入
在Tauri应用中创建一个代理页面，注入必要的JavaScript代码：

```html
<!DOCTYPE html>
<html>
<head>
    <script type="module">
        // 加载Tauri API
        import { open, save } from '@tauri-apps/plugin-dialog';

        // 暴露到全局对象供iframe内页面使用
        window.__TAURI_DIALOG__ = { open, save };
    </script>
</head>
<body>
    <iframe src="https://xuxikai886.github.io/外卖图片系统/"></iframe>
</body>
</html>
```

## 测试验证

启动开发服务器后，可以通过以下方式测试：

```bash
npm run tauri:dev
```

在应用中打开浏览器控制台（F12），执行：

```javascript
// 测试文件选择
const { open } = await import('@tauri-apps/plugin-dialog');
const file = await open({ multiple: false });
console.log('选中的文件:', file);
```

## 总结

✅ **已完成的配置**：
- 安装 `tauri-plugin-dialog` Rust依赖
- 在 `lib.rs` 中初始化插件
- 安装 `@tauri-apps/plugin-dialog` npm包

⚠️ **待完成的工作**：
- 修改"外卖图片系统"工具代码，使用Tauri Dialog API替代HTML file input
- 或者通过代理页面注入Tauri API

## 相关链接

- [Tauri Dialog Plugin官方文档](https://v2.tauri.app/plugin/dialog/)
- [JavaScript API参考](https://v2.tauri.app/reference/javascript/dialog/)
- [Rust API文档](https://docs.rs/tauri-plugin-dialog/latest/tauri_plugin_dialog/)
