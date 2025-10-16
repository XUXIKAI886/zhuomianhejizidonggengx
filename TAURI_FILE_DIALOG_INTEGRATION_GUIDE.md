# Tauri 桌面应用文件对话框集成指南

## 📋 目录
1. [概述](#概述)
2. [前提条件检查](#前提条件检查)
3. [Tauri 后端配置](#tauri-后端配置)
4. [权限配置](#权限配置)
5. [前端代码修改](#前端代码修改)
6. [测试验证](#测试验证)
7. [常见问题](#常见问题)

---

## 概述

当您需要在新的外部URL工具中集成文件选择功能时,需要完成以下步骤:
1. 确保Tauri插件已安装
2. 配置远程URL权限
3. 修改工具页面代码以使用Tauri API

**适用场景**: 任何托管在外部URL(如GitHub Pages)的工具页面需要在桌面应用中选择本地文件。

---

## 前提条件检查

### 1. 检查插件是否已安装

#### Rust依赖检查
打开 `src-tauri/Cargo.toml`,确认包含以下依赖:

```toml
[dependencies]
tauri-plugin-dialog = "2.4.0"
tauri-plugin-fs = "2.4.0"
```

如果没有,执行:
```bash
cd src-tauri
cargo add tauri-plugin-dialog@2.4.0
cargo add tauri-plugin-fs@2.4.0
```

#### npm依赖检查
打开 `package.json`,确认包含:

```json
{
  "dependencies": {
    "@tauri-apps/plugin-dialog": "^2.x.x",
    "@tauri-apps/plugin-fs": "^2.x.x"
  }
}
```

如果没有,执行:
```bash
npm install @tauri-apps/plugin-dialog @tauri-apps/plugin-fs --legacy-peer-deps
```

### 2. 检查插件初始化

打开 `src-tauri/src/lib.rs`,确认包含:

```rust
.plugin(tauri_plugin_dialog::init())
.plugin(tauri_plugin_fs::init())
```

完整示例:
```rust
pub fn run() {
  tauri::Builder::default()
    .setup(|app| {
      // ... 其他设置
      Ok(())
    })
    .plugin(tauri_plugin_shell::init())
    .plugin(tauri_plugin_dialog::init())  // ← 确保这行存在
    .plugin(tauri_plugin_fs::init())      // ← 确保这行存在
    .invoke_handler(tauri::generate_handler![
      // ... 命令列表
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
```

---

## Tauri 后端配置

### 步骤1: 配置远程URL权限

编辑 `src-tauri/capabilities/iframe-capability.json`:

```json
{
  "$schema": "../gen/schemas/desktop-schema.json",
  "identifier": "iframe-capability",
  "description": "允许iframe内页面使用shell.open打开外部链接和文件对话框",
  "windows": [
    "main"
  ],
  "remote": {
    "urls": [
      "https://*",
      "http://*"
    ]
  },
  "permissions": [
    "shell:allow-open",
    "dialog:default",
    "dialog:allow-ask",
    "dialog:allow-confirm",
    "dialog:allow-message",
    "dialog:allow-open",
    "dialog:allow-save",
    "fs:default",
    "fs:allow-read-text-file",
    "fs:allow-read-file",
    "fs:allow-write-file",
    "fs:allow-write-text-file",
    "fs:allow-exists",
    "fs:allow-stat"
  ],
  "platforms": ["linux", "macOS", "windows"]
}
```

**重要说明**:
- `remote.urls` 允许所有 HTTP/HTTPS URL 访问 Tauri API
- 如果需要限制特定域名,可以修改为: `["https://xuxikai886.github.io/**", "https://yourdomain.com/**"]`

### 步骤2: 配置本地权限(可选)

编辑 `src-tauri/capabilities/main-capability.json`,添加相同的权限:

```json
{
  "permissions": [
    // ... 其他权限
    "dialog:default",
    "dialog:allow-ask",
    "dialog:allow-confirm",
    "dialog:allow-message",
    "dialog:allow-open",
    "dialog:allow-save",
    "fs:default",
    "fs:allow-read-text-file",
    "fs:allow-read-file",
    "fs:allow-write-file",
    "fs:allow-write-text-file",
    "fs:allow-exists",
    "fs:allow-stat"
  ]
}
```

---

## 权限配置

### 可用的文件系统权限

| 权限标识符 | 功能描述 |
|-----------|---------|
| `fs:default` | 文件系统基础权限 |
| `fs:allow-read-text-file` | 允许读取文本文件 |
| `fs:allow-read-file` | 允许读取二进制文件 |
| `fs:allow-write-text-file` | 允许写入文本文件 |
| `fs:allow-write-file` | 允许写入二进制文件 |
| `fs:allow-exists` | 允许检查文件是否存在 |
| `fs:allow-stat` | 允许获取文件信息 |

### 可用的对话框权限

| 权限标识符 | 功能描述 |
|-----------|---------|
| `dialog:default` | 对话框基础权限 |
| `dialog:allow-open` | 允许打开文件/文件夹选择对话框 |
| `dialog:allow-save` | 允许打开保存文件对话框 |
| `dialog:allow-message` | 允许显示消息对话框 |
| `dialog:allow-ask` | 允许显示询问对话框 |
| `dialog:allow-confirm` | 允许显示确认对话框 |

---

## 前端代码修改

### 步骤1: 环境检测

在工具页面的JavaScript代码中添加Tauri环境检测:

```javascript
// 检测是否在Tauri环境中运行
function isTauriEnvironment() {
    return typeof window !== 'undefined' &&
           window.__TAURI__ !== undefined &&
           window.__TAURI__.core !== undefined;
}

console.log('[环境检测] Tauri环境:', isTauriEnvironment());
```

### 步骤2: 修改文件选择代码

**原始代码** (HTML `<input type="file">`):
```html
<!-- ❌ 这在Tauri中不工作 -->
<input type="file" id="fileInput" accept=".txt,.csv">
<button onclick="handleFileSelect()">选择文件</button>

<script>
function handleFileSelect() {
    const input = document.getElementById('fileInput');
    input.click();
    input.onchange = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target.result;
            processFileContent(content);
        };
        reader.readAsText(file);
    };
}
</script>
```

**修改后的代码** (使用Tauri API):
```html
<button onclick="handleFileSelect()">选择文件</button>

<script>
async function handleFileSelect() {
    // 检查是否在Tauri环境
    if (!isTauriEnvironment()) {
        alert('此功能仅在桌面应用中可用');
        return;
    }

    try {
        console.log('[文件选择] 正在打开文件选择对话框...');

        // 调用Tauri文件对话框API
        const filePath = await window.__TAURI__.core.invoke('plugin:dialog|open', {
            options: {
                multiple: false,      // 是否允许多选
                directory: false,     // 是否选择文件夹
                title: '选择文件',    // 对话框标题
                filters: [{           // 文件类型过滤器(可选)
                    name: '文本文件',
                    extensions: ['txt', 'csv']
                }]
            }
        });

        if (!filePath) {
            console.log('[文件选择] 用户取消了选择');
            return;
        }

        console.log('[文件选择] 已选择文件:', filePath);

        // 读取文件内容
        const content = await window.__TAURI__.core.invoke('plugin:fs|read_text_file', {
            path: filePath
        });

        console.log('[文件读取] 文件内容长度:', content.length);

        // 处理文件内容
        processFileContent(content, filePath);

    } catch (error) {
        console.error('[文件选择] 错误:', error);
        alert('文件选择失败: ' + error.message);
    }
}

// 检测是否在Tauri环境中
function isTauriEnvironment() {
    return typeof window !== 'undefined' &&
           window.__TAURI__ !== undefined &&
           window.__TAURI__.core !== undefined;
}

// 处理文件内容的函数
function processFileContent(content, filePath) {
    // 您的业务逻辑
    console.log('文件路径:', filePath);
    console.log('文件内容:', content);
}
</script>
```

### 步骤3: 多文件选择

如果需要选择多个文件:

```javascript
async function selectMultipleFiles() {
    const filePaths = await window.__TAURI__.core.invoke('plugin:dialog|open', {
        options: {
            multiple: true,       // ← 设置为 true
            directory: false,
            title: '选择多个文件'
        }
    });

    if (!filePaths || filePaths.length === 0) {
        console.log('用户取消了选择');
        return;
    }

    console.log('选中的文件:', filePaths);

    // 读取所有文件
    for (const filePath of filePaths) {
        const content = await window.__TAURI__.core.invoke('plugin:fs|read_text_file', {
            path: filePath
        });
        processFileContent(content, filePath);
    }
}
```

### 步骤4: 选择文件夹

如果需要选择文件夹:

```javascript
async function selectFolder() {
    const folderPath = await window.__TAURI__.core.invoke('plugin:dialog|open', {
        options: {
            multiple: false,
            directory: true,      // ← 设置为 true
            title: '选择文件夹'
        }
    });

    if (!folderPath) {
        console.log('用户取消了选择');
        return;
    }

    console.log('选中的文件夹:', folderPath);
}
```

### 步骤5: 保存文件对话框

如果需要保存文件:

```javascript
async function saveFile(content, defaultFileName) {
    try {
        // 打开保存对话框
        const filePath = await window.__TAURI__.core.invoke('plugin:dialog|save', {
            options: {
                title: '保存文件',
                defaultPath: defaultFileName,
                filters: [{
                    name: '文本文件',
                    extensions: ['txt']
                }]
            }
        });

        if (!filePath) {
            console.log('用户取消了保存');
            return;
        }

        // 写入文件
        await window.__TAURI__.core.invoke('plugin:fs|write_text_file', {
            path: filePath,
            contents: content
        });

        console.log('文件已保存:', filePath);
        alert('文件保存成功!');

    } catch (error) {
        console.error('保存文件失败:', error);
        alert('保存文件失败: ' + error.message);
    }
}
```

### 步骤6: 兼容性处理(Web + Tauri双端支持)

如果您的工具需要同时在Web浏览器和Tauri桌面应用中运行:

```javascript
async function selectFileUniversal() {
    if (isTauriEnvironment()) {
        // Tauri桌面环境
        return await selectFileWithTauri();
    } else {
        // Web浏览器环境
        return await selectFileWithHTML();
    }
}

// Tauri实现
async function selectFileWithTauri() {
    const filePath = await window.__TAURI__.core.invoke('plugin:dialog|open', {
        options: {
            multiple: false,
            directory: false,
            title: '选择文件'
        }
    });

    if (!filePath) return null;

    const content = await window.__TAURI__.core.invoke('plugin:fs|read_text_file', {
        path: filePath
    });

    return { path: filePath, content: content };
}

// Web实现
async function selectFileWithHTML() {
    return new Promise((resolve, reject) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) {
                resolve(null);
                return;
            }
            const reader = new FileReader();
            reader.onload = (event) => {
                resolve({
                    path: file.name,
                    content: event.target.result
                });
            };
            reader.onerror = reject;
            reader.readAsText(file);
        };
        input.click();
    });
}

// 检测Tauri环境
function isTauriEnvironment() {
    return typeof window !== 'undefined' &&
           window.__TAURI__ !== undefined &&
           window.__TAURI__.core !== undefined;
}
```

---

## 测试验证

### 步骤1: 启动开发服务器

```bash
npm run tauri:dev
```

### 步骤2: 测试文件选择

1. 在桌面应用中打开您的工具页面
2. 打开浏览器开发者工具(F12)
3. 点击"选择文件"按钮
4. 检查控制台输出:
   ```
   [环境检测] Tauri环境: true
   [文件选择] 正在打开文件选择对话框...
   [文件选择] 已选择文件: D:\test\example.txt
   [文件读取] 文件内容长度: 1234
   ```

### 步骤3: 常见测试场景

| 测试场景 | 预期结果 |
|---------|---------|
| 点击选择按钮 | 弹出原生文件选择对话框 |
| 选择文件并确认 | 成功读取文件内容 |
| 点击取消 | 不报错,提示用户取消 |
| 选择不支持的文件类型 | 根据filters过滤 |
| 在Web浏览器中打开 | 降级使用HTML input |

---

## 常见问题

### Q1: 错误 "dialog.open not allowed"

**错误信息**:
```
dialog.open not allowed on window "main", webview "main", URL: https://example.com/
```

**解决方案**:
1. 检查 `src-tauri/capabilities/iframe-capability.json` 中的 `remote.urls` 配置
2. 确保URL匹配: `"https://*"` 或具体域名
3. 重新编译: `npm run tauri:dev`

### Q2: 错误 "Cannot read properties of undefined (reading 'readTextFile')"

**错误信息**:
```
TypeError: Cannot read properties of undefined (reading 'readTextFile')
```

**解决方案**:
1. 检查 `src-tauri/Cargo.toml` 是否包含 `tauri-plugin-fs`
2. 检查 `src-tauri/src/lib.rs` 是否包含 `.plugin(tauri_plugin_fs::init())`
3. 检查 capabilities 文件是否包含 fs 权限
4. 重新编译

### Q3: 文件路径包含中文乱码

**解决方案**:
使用 UTF-8 编码读取文件:
```javascript
const content = await window.__TAURI__.core.invoke('plugin:fs|read_text_file', {
    path: filePath,
    encoding: 'utf-8'  // 明确指定编码
});
```

### Q4: 如何限制文件大小?

**解决方案**:
先获取文件信息:
```javascript
const fileInfo = await window.__TAURI__.core.invoke('plugin:fs|stat', {
    path: filePath
});

const fileSizeMB = fileInfo.size / (1024 * 1024);
if (fileSizeMB > 10) {
    alert('文件大小超过10MB限制');
    return;
}
```

### Q5: 如何在新工具中快速集成?

**快速集成清单**:
1. ✅ 复制"环境检测"函数到工具页面
2. ✅ 将 `<input type="file">` 替换为按钮
3. ✅ 使用 `window.__TAURI__.core.invoke` 调用对话框
4. ✅ 使用 `plugin:fs|read_text_file` 读取文件
5. ✅ 添加错误处理和用户提示
6. ✅ 在开发环境测试

---

## 完整示例代码

### 示例: 简单的文本文件选择器

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <title>文件选择示例</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            padding: 20px;
        }
        button {
            padding: 10px 20px;
            font-size: 16px;
            cursor: pointer;
        }
        #output {
            margin-top: 20px;
            padding: 10px;
            border: 1px solid #ccc;
            min-height: 100px;
            white-space: pre-wrap;
        }
    </style>
</head>
<body>
    <h1>文件选择示例</h1>
    <button onclick="selectFile()">选择文本文件</button>
    <div id="output"></div>

    <script>
        // 环境检测
        function isTauriEnvironment() {
            return typeof window !== 'undefined' &&
                   window.__TAURI__ !== undefined &&
                   window.__TAURI__.core !== undefined;
        }

        // 输出日志
        function log(message) {
            const output = document.getElementById('output');
            const timestamp = new Date().toLocaleTimeString();
            output.textContent += `[${timestamp}] ${message}\n`;
            console.log(message);
        }

        // 文件选择
        async function selectFile() {
            if (!isTauriEnvironment()) {
                log('❌ 此功能仅在桌面应用中可用');
                alert('此功能仅在桌面应用中可用');
                return;
            }

            try {
                log('📂 打开文件选择对话框...');

                // 选择文件
                const filePath = await window.__TAURI__.core.invoke('plugin:dialog|open', {
                    options: {
                        multiple: false,
                        directory: false,
                        title: '选择文本文件',
                        filters: [{
                            name: '文本文件',
                            extensions: ['txt', 'md', 'csv']
                        }]
                    }
                });

                if (!filePath) {
                    log('⚠️  用户取消了选择');
                    return;
                }

                log(`✅ 已选择文件: ${filePath}`);

                // 读取文件内容
                const content = await window.__TAURI__.core.invoke('plugin:fs|read_text_file', {
                    path: filePath
                });

                log(`📄 文件内容长度: ${content.length} 字符`);
                log(`📝 文件内容预览:\n${content.substring(0, 200)}...`);

            } catch (error) {
                log(`❌ 错误: ${error.message}`);
                console.error('详细错误:', error);
                alert('文件选择失败: ' + error.message);
            }
        }

        // 页面加载时检测环境
        window.addEventListener('DOMContentLoaded', () => {
            const env = isTauriEnvironment() ? 'Tauri桌面应用' : 'Web浏览器';
            log(`🚀 运行环境: ${env}`);
        });
    </script>
</body>
</html>
```

---

## 添加新工具到应用

### 步骤1: 修改 lib/tool-data.ts

添加新工具到工具列表:

```typescript
{
  id: 36,  // 使用下一个可用ID
  name: "您的新工具名称",
  description: "工具描述",
  category: "运营工具",
  url: "https://yourdomain.com/your-tool.html",
  icon: FileText,  // 从 lucide-react 导入的图标
  rating: 4.8,
  downloads: "0.5k",
  tags: ["文件处理", "数据导入", "Tauri集成"],
  color: "from-blue-300 to-blue-400",
  featured: false,
  lastUpdated: "今天",
  toolType: "web"
}
```

### 步骤2: 在工具页面中集成文件选择

参考本文档的"前端代码修改"章节,将文件选择代码集成到您的工具页面中。

---

## 版本兼容性

| 组件 | 版本要求 |
|-----|---------|
| Tauri | >= 2.0 |
| tauri-plugin-dialog | >= 2.4.0 |
| tauri-plugin-fs | >= 2.4.0 |
| @tauri-apps/plugin-dialog | >= 2.x |
| @tauri-apps/plugin-fs | >= 2.x |

---

## 总结

本指南涵盖了在Tauri桌面应用中集成文件对话框的完整流程:

✅ **后端配置**: 安装插件、初始化、配置权限
✅ **前端开发**: 环境检测、API调用、错误处理
✅ **测试验证**: 开发环境测试、常见问题排查
✅ **最佳实践**: 兼容性处理、用户体验优化

**下次添加新工具时的快速步骤**:
1. 确认插件已安装(本指南前提条件部分)
2. 复制"完整示例代码"到工具页面
3. 根据需求调整文件类型过滤器
4. 测试文件选择和读取功能
5. 添加工具到 `lib/tool-data.ts`

**需要帮助?**
- 查看测试工具: `http://localhost:3000/test-dialog.html`
- 检查控制台日志(F12)
- 参考本文档"常见问题"章节

---

**文档版本**: v1.0
**最后更新**: 2025年10月16日
**适用项目**: 呈尚策划工具中心 Tauri桌面应用
