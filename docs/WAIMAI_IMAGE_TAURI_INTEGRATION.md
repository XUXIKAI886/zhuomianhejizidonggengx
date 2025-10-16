# 外卖图片系统 Tauri集成方案

## 问题描述

外卖图片系统（https://xuxikai886.github.io/touxiangdianzhaohaibaotiqu/）在普通浏览器中可以正常使用文件选择功能，但在Tauri桌面应用中无法打开文件选择对话框。

**根本原因**：
- 该工具使用HTML的 `<input type="file">` 元素来选择文件
- 在Tauri的WebView环境中，出于安全考虑，这种方式无法访问本地文件系统
- 必须使用Tauri提供的Dialog API来实现文件选择

## 解决方案

### 方案A：修改源码（推荐 - 长期方案）

如果你有外卖图片系统的源码访问权限，建议直接修改源码添加Tauri支持。

#### 步骤1：添加Tauri环境检测

```javascript
// 检查是否在Tauri环境中运行
function isTauriEnvironment() {
    return typeof window.__TAURI__ !== 'undefined';
}
```

#### 步骤2：创建统一的文件选择函数

```javascript
/**
 * 统一的文件选择函数 - 自动适配Tauri和浏览器环境
 */
async function selectFile(options = {}) {
    if (isTauriEnvironment()) {
        // Tauri环境 - 使用Dialog API
        return await selectFileInTauri(options);
    } else {
        // 浏览器环境 - 使用HTML input
        return await selectFileInBrowser(options);
    }
}

/**
 * Tauri环境下的文件选择
 */
async function selectFileInTauri(options = {}) {
    try {
        const result = await window.__TAURI__.core.invoke('plugin:dialog|open', {
            options: {
                multiple: options.multiple || false,
                directory: options.directory || false,
                title: options.title || '选择监控文件',
                filters: options.filters || []
            }
        });

        if (result) {
            console.log('选中的文件路径:', result);
            // result 是文件的完整路径字符串（单选）
            // 或路径数组（多选）
            return result;
        } else {
            console.log('用户取消了选择');
            return null;
        }
    } catch (error) {
        console.error('Tauri文件选择失败:', error);
        alert('文件选择失败: ' + error.message);
        return null;
    }
}

/**
 * 浏览器环境下的文件选择
 */
async function selectFileInBrowser(options = {}) {
    return new Promise((resolve) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.multiple = options.multiple || false;

        // 设置文件类型过滤器
        if (options.filters && options.filters.length > 0) {
            const accept = options.filters
                .map(filter => filter.extensions.map(ext => '.' + ext).join(','))
                .join(',');
            input.accept = accept;
        }

        input.onchange = (e) => {
            const files = e.target.files;
            if (files && files.length > 0) {
                if (options.multiple) {
                    resolve(Array.from(files));
                } else {
                    resolve(files[0]);
                }
            } else {
                resolve(null);
            }
        };

        input.click();
    });
}
```

#### 步骤3：替换现有的文件选择按钮逻辑

**原代码**（假设）：
```javascript
// ❌ 原始代码 - 只在浏览器中工作
document.getElementById('selectFileBtn').addEventListener('click', function() {
    document.getElementById('fileInput').click();
});

document.getElementById('fileInput').addEventListener('change', function(e) {
    const file = e.target.files[0];
    processFile(file);
});
```

**修改后**：
```javascript
// ✅ 修改后的代码 - 同时支持Tauri和浏览器
document.getElementById('selectFileBtn').addEventListener('click', async function() {
    const file = await selectFile({
        multiple: false,
        filters: [{
            name: 'Excel文件',
            extensions: ['xlsx', 'xls', 'csv']
        }]
    });

    if (file) {
        processFile(file);
    }
});
```

#### 步骤4：处理文件读取

在Tauri环境中，`selectFile()` 返回的是文件路径字符串，而不是File对象。需要使用Tauri的fs插件来读取文件内容。

```javascript
async function processFile(fileOrPath) {
    let fileContent;

    if (isTauriEnvironment() && typeof fileOrPath === 'string') {
        // Tauri环境 - fileOrPath是文件路径
        try {
            const { readBinaryFile } = window.__TAURI__.fs;
            const bytes = await readBinaryFile(fileOrPath);
            // 将字节数组转换为需要的格式
            fileContent = new Blob([bytes]);
        } catch (error) {
            console.error('读取文件失败:', error);
            alert('读取文件失败: ' + error.message);
            return;
        }
    } else {
        // 浏览器环境 - fileOrPath是File对象
        fileContent = fileOrPath;
    }

    // 继续处理文件内容...
}
```

#### 步骤5：更新Tauri配置（如果需要fs插件）

如果需要读取文件内容，需要在 `src-tauri/capabilities/main-capability.json` 中添加fs权限：

```json
{
  "permissions": [
    "fs:default",
    "fs:allow-read-file",
    "fs:allow-read-text-file"
  ]
}
```

### 方案B：使用代理页面（临时方案 - 已实现）

如果无法修改源码，可以使用代理页面方案。我已经创建了代理页面：`public/proxy-waimai-image.html`

#### 使用方法：

1. **更新工具URL**，将外卖图片系统的URL改为代理页面：

```typescript
// 在 lib/tool-data.ts 中
{
  id: 33,
  name: "外卖图片系统",
  url: "http://localhost:3000/proxy-waimai-image.html", // ← 改为代理页面
  // ... 其他配置保持不变
}
```

2. **修改外卖图片系统源码**，使其通过postMessage调用Tauri API：

```javascript
// 在外卖图片系统的代码中
async function selectMonitorFile() {
    // 检查是否在iframe中且父窗口有Tauri API
    if (window.parent && window.parent !== window) {
        // 通过postMessage请求父窗口打开文件选择
        const requestId = Date.now();

        return new Promise((resolve, reject) => {
            // 监听结果
            const handleMessage = (event) => {
                if (event.data.type === 'TAURI_DIALOG_RESULT' &&
                    event.data.requestId === requestId) {
                    window.removeEventListener('message', handleMessage);

                    if (event.data.error) {
                        reject(new Error(event.data.error));
                    } else {
                        resolve(event.data.result);
                    }
                }
            };

            window.addEventListener('message', handleMessage);

            // 发送请求
            window.parent.postMessage({
                type: 'TAURI_DIALOG_OPEN',
                requestId: requestId,
                options: {
                    multiple: false,
                    directory: false,
                    filters: [{
                        name: 'Excel文件',
                        extensions: ['xlsx', 'xls', 'csv']
                    }]
                }
            }, '*');

            // 超时处理
            setTimeout(() => {
                window.removeEventListener('message', handleMessage);
                reject(new Error('文件选择超时'));
            }, 30000);
        });
    } else {
        // 降级到传统方式
        return selectFileInBrowser();
    }
}
```

#### 代理页面的工作原理：

1. 代理页面加载外卖图片系统到iframe中
2. 暴露 `window.selectFileForIframe()` 函数供iframe调用
3. 监听来自iframe的postMessage请求
4. 调用Tauri Dialog API
5. 将结果通过postMessage返回给iframe

#### 代理页面的限制：

- ⚠️ 由于跨域安全限制，iframe内的脚本无法直接访问父窗口的函数
- ✅ 但可以通过 `postMessage` API进行安全通信
- ⚠️ 需要修改外卖图片系统的源码来使用postMessage通信

## 推荐做法

### 短期方案（立即可用）

在外卖图片系统的源码中添加Tauri环境检测和适配代码（方案A的步骤1-3）。这是最直接、最可靠的方案。

### 中期方案（如果无法修改源码）

1. Fork外卖图片系统的仓库
2. 添加Tauri支持代码
3. 部署自己的版本
4. 在桌面应用中使用自己的版本

### 长期方案

向外卖图片系统的维护者提交Pull Request，添加Tauri环境支持，使其原生支持桌面应用环境。

## 文件类型过滤器示例

```javascript
// Excel文件
filters: [{
  name: 'Excel文件',
  extensions: ['xlsx', 'xls', 'csv']
}]

// 图片文件
filters: [{
  name: '图片',
  extensions: ['png', 'jpg', 'jpeg', 'gif', 'webp']
}]

// 多种类型
filters: [
  { name: 'Excel', extensions: ['xlsx', 'xls'] },
  { name: '图片', extensions: ['png', 'jpg'] },
  { name: '所有文件', extensions: ['*'] }
]
```

## 测试验证

1. **在浏览器中测试**：确保修改后的代码在浏览器中仍然正常工作
2. **在Tauri中测试**：在桌面应用中测试文件选择功能
3. **测试取消操作**：确保用户取消选择时应用不会崩溃
4. **测试错误处理**：模拟文件读取失败等错误情况

## 相关资源

- [Tauri Dialog Plugin文档](https://v2.tauri.app/plugin/dialog/)
- [本项目的Dialog使用指南](./TAURI_FILE_DIALOG_GUIDE.md)
- [测试工具示例](../public/test-dialog.html)
- [代理页面实现](../public/proxy-waimai-image.html)

## 需要帮助？

如果在集成过程中遇到问题，可以：
1. 查看测试工具的完整实现（`public/test-dialog.html`）
2. 参考完整的Dialog使用指南（`docs/TAURI_FILE_DIALOG_GUIDE.md`）
3. 在开发者工具控制台中查看错误信息
4. 检查Tauri的权限配置是否正确
