# Tauri文件对话框快速参考卡片

## 🚀 核心代码速查

### 1️⃣ 环境检测（复制粘贴即用）

```javascript
// 检测Tauri环境
function isTauriEnvironment() {
    return typeof window.__TAURI__ !== 'undefined';
}
```

### 2️⃣ 选择单个文件（最常用）

```javascript
// 点击按钮选择文件
document.getElementById('selectFileBtn').addEventListener('click', async function() {
    const file = await selectFile({
        multiple: false,
        filters: [
            { name: 'Excel文件', extensions: ['xlsx', 'xls', 'csv'] },
            { name: '所有文件', extensions: ['*'] }
        ],
        title: '选择监控文件'
    });

    if (file) {
        await handleSelectedFile(file);
    }
});
```

### 3️⃣ 核心函数：selectFile()

```javascript
async function selectFile(options = {}) {
    const config = {
        multiple: options.multiple || false,
        directory: options.directory || false,
        title: options.title || '选择文件',
        filters: options.filters || []
    };

    if (isTauriEnvironment()) {
        // Tauri环境
        const result = await window.__TAURI__.core.invoke('plugin:dialog|open', {
            options: config
        });
        return result;
    } else {
        // 浏览器环境
        return new Promise((resolve) => {
            const input = document.createElement('input');
            input.type = 'file';
            input.multiple = config.multiple;

            if (config.filters.length > 0) {
                const accept = config.filters
                    .map(f => f.extensions.map(e => '.' + e).join(','))
                    .join(',');
                input.accept = accept;
            }

            input.onchange = (e) => {
                const files = e.target.files;
                if (files && files.length > 0) {
                    resolve(config.multiple ? Array.from(files) : files[0]);
                } else {
                    resolve(null);
                }
            };

            input.click();
        });
    }
}
```

### 4️⃣ 文件处理适配

```javascript
async function handleSelectedFile(fileOrPath) {
    if (isTauriEnvironment() && typeof fileOrPath === 'string') {
        // Tauri: fileOrPath是文件路径字符串
        console.log('文件路径:', fileOrPath);

        // 读取文本文件
        const content = await window.__TAURI__.fs.readTextFile(fileOrPath);
        processContent(content);

        // 或读取二进制文件
        // const bytes = await window.__TAURI__.fs.readBinaryFile(fileOrPath);

    } else if (fileOrPath instanceof File) {
        // 浏览器: fileOrPath是File对象
        console.log('文件名:', fileOrPath.name);

        const reader = new FileReader();
        reader.onload = (e) => {
            processContent(e.target.result);
        };
        reader.readAsText(fileOrPath);
    }
}
```

---

## 📋 常用配置速查

### 文件类型过滤器

```javascript
// Excel文件
filters: [{ name: 'Excel', extensions: ['xlsx', 'xls', 'csv'] }]

// 图片文件
filters: [{ name: '图片', extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp'] }]

// 所有文件
filters: [{ name: '所有文件', extensions: ['*'] }]

// 多种类型
filters: [
    { name: 'Excel', extensions: ['xlsx', 'xls'] },
    { name: 'CSV', extensions: ['csv'] },
    { name: '所有文件', extensions: ['*'] }
]
```

### 选择模式

```javascript
// 选择单个文件
{ multiple: false, directory: false }

// 选择多个文件
{ multiple: true, directory: false }

// 选择文件夹
{ multiple: false, directory: true }
```

---

## 🔧 Tauri后端配置（必需）

### 1. 安装Rust依赖

```bash
cd src-tauri
cargo add tauri-plugin-dialog
```

### 2. 初始化插件（src-tauri/src/lib.rs）

```rust
pub fn run() {
    tauri::Builder::default()
        // ... 其他插件
        .plugin(tauri_plugin_dialog::init())  // ← 添加这行
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

### 3. 添加权限（src-tauri/capabilities/main-capability.json）

```json
{
  "permissions": [
    "dialog:default",
    "dialog:allow-open",
    "dialog:allow-save",
    "dialog:allow-ask",
    "dialog:allow-confirm",
    "dialog:allow-message"
  ]
}
```

### 4. （可选）如需读取文件内容

```bash
# 安装fs插件
cd src-tauri
cargo add tauri-plugin-fs
```

```rust
// 初始化fs插件（src-tauri/src/lib.rs）
.plugin(tauri_plugin_fs::init())
```

```json
// 添加fs权限（capabilities/main-capability.json）
{
  "permissions": [
    "fs:default",
    "fs:allow-read-file",
    "fs:allow-read-text-file",
    "fs:allow-read-binary-file"
  ]
}
```

---

## 🐛 常见问题速查

### 问题：点击按钮无反应

```javascript
// 添加调试日志
console.log('按钮点击');
console.log('Tauri环境:', isTauriEnvironment());
console.log('__TAURI__:', window.__TAURI__);
```

**检查**：
- ✅ Dialog插件已初始化？
- ✅ 权限已配置？
- ✅ F12控制台有报错吗？

### 问题：提示"dialog.open not allowed"

**解决**：在 `capabilities/main-capability.json` 添加权限：
```json
"dialog:allow-open"
```

### 问题：无法读取文件内容

**解决**：
1. 安装fs插件
2. 初始化fs插件
3. 添加fs权限

---

## ⚡ 最小修改示例

如果您只想最快速度让代码工作，只需要：

### 步骤1：添加检测和选择函数（复制到JS文件开头）

```javascript
function isTauriEnvironment() {
    return typeof window.__TAURI__ !== 'undefined';
}

async function selectFile(options = {}) {
    if (isTauriEnvironment()) {
        return await window.__TAURI__.core.invoke('plugin:dialog|open', {
            options: {
                multiple: options.multiple || false,
                directory: options.directory || false,
                title: options.title || '选择文件',
                filters: options.filters || []
            }
        });
    } else {
        return new Promise((resolve) => {
            const input = document.createElement('input');
            input.type = 'file';
            input.multiple = options.multiple || false;
            input.onchange = (e) => {
                const files = e.target.files;
                resolve(files && files.length > 0 ? (options.multiple ? Array.from(files) : files[0]) : null);
            };
            input.click();
        });
    }
}
```

### 步骤2：修改按钮事件（找到您的按钮点击代码）

```javascript
// 原代码：
// $('#btn').click(() => $('#fileInput').click());

// 改为：
$('#btn').click(async () => {
    const file = await selectFile({ multiple: false });
    if (file) {
        // 您原来的处理逻辑
    }
});
```

**就这么简单！** ✅

---

## 📞 获取帮助

- 📖 详细指南：`docs/WAIMAI_IMAGE_SOURCE_CODE_MODIFICATION_GUIDE.md`
- 🧪 测试工具：打开桌面应用 → 美工工具 → 文件对话框测试工具
- 📚 完整文档：`docs/TAURI_FILE_DIALOG_GUIDE.md`
