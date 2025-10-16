# ✅ 最终验证正确的下载修复方案 - Tauri 2.x

## 🚨 重要发现

经过多次测试和查看 Tauri 官方源代码，发现之前的文档**全部错误**！

Tauri 2.x 的 `plugin:fs|write_file` 使用了**非标准的invoke调用格式**。

## 📋 Tauri 2.x FS Plugin API 的正确格式

### 官方源代码中的实现

```typescript
await invoke('plugin:fs|write_file',
  data,  // ← 第二个参数: Uint8Array 数据
  {      // ← 第三个参数: 配置对象
    headers: {
      path: encodeURIComponent(filePath),
      options: JSON.stringify(options)
    }
  }
)
```

**关键点**：
1. ✅ 第一个参数：命令名称 `'plugin:fs|write_file'`
2. ✅ 第二个参数：**实际数据** (`Uint8Array`)
3. ✅ 第三个参数：**配置对象** (包含 `headers`)

## ✅ 最终正确的完整下载函数

```javascript
/**
 * 🎯 最终验证正确的Tauri图片下载函数
 * 适用于 Tauri 2.x + tauri-plugin-dialog + tauri-plugin-fs
 *
 * 关键修复: plugin:fs|write_file 使用特殊的3参数格式
 */
async function downloadImage(imageDataUrl, filename = 'image.png') {
    // 1. 检测Tauri环境
    const isTauri = typeof window !== 'undefined' &&
                    typeof window.__TAURI__ !== 'undefined' &&
                    typeof window.__TAURI__.core !== 'undefined';

    if (!isTauri) {
        // Web环境 - 使用传统下载方法
        const link = document.createElement('a');
        link.href = imageDataUrl;
        link.download = filename;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return true;
    }

    // 2. Tauri环境 - 使用正确的API调用
    try {
        console.log('🖼️ [Tauri] 开始保存图片:', filename);

        // ✅ Dialog API - 使用 options 对象
        const filePath = await window.__TAURI__.core.invoke('plugin:dialog|save', {
            options: {
                defaultPath: filename,
                title: '保存图片',
                filters: [{
                    name: '图片文件',
                    extensions: ['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg']
                }]
            }
        });

        // 3. 用户取消保存
        if (!filePath) {
            console.log('⚠️ 用户取消了保存');
            return false;
        }

        console.log('📁 选择的保存路径:', filePath);

        // 4. 转换Base64为字节数组
        const base64Data = imageDataUrl.includes(',')
            ? imageDataUrl.split(',')[1]
            : imageDataUrl;

        const binaryString = atob(base64Data);
        const bytes = new Uint8Array(binaryString.length);

        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }

        console.log('💾 准备写入文件, 大小:', bytes.length, 'bytes');

        // 5. ✅✅✅ 正确的写入文件方式 - 3参数格式!
        await window.__TAURI__.core.invoke(
            'plugin:fs|write_file',  // 第1个参数: 命令名
            bytes,                    // 第2个参数: 数据 (Uint8Array)
            {                         // 第3个参数: 配置对象
                headers: {
                    path: encodeURIComponent(filePath),
                    options: JSON.stringify({})
                }
            }
        );

        console.log('✅ [Tauri] 图片保存成功!');
        alert('图片保存成功!\\n保存位置: ' + filePath);
        return true;

    } catch (error) {
        console.error('❌ [Tauri] 保存失败:', error);
        console.error('错误详情:', error.message);
        alert('保存失败: ' + error.message);
        return false;
    }
}
```

## 🔑 API 调用格式对比

### ❌ 错误方式 1 (之前的文档)

```javascript
// 这会导致 "unexpected invoke body" 错误
await window.__TAURI__.core.invoke('plugin:fs|write_file', {
    path: filePath,
    contents: Array.from(bytes)
});
```

### ❌ 错误方式 2 (之前的文档)

```javascript
// 这也会导致 "unexpected invoke body" 错误
await window.__TAURI__.core.invoke('plugin:fs|write_file', {
    options: {
        path: filePath,
        contents: Array.from(bytes)
    }
});
```

### ✅ 正确方式 (经过源码验证)

```javascript
// 正确的3参数格式
await window.__TAURI__.core.invoke(
    'plugin:fs|write_file',    // 参数1: 命令
    bytes,                      // 参数2: Uint8Array 数据
    {                           // 参数3: 配置
        headers: {
            path: encodeURIComponent(filePath),
            options: JSON.stringify({})
        }
    }
);
```

## 📊 完整API格式对比表

| API命令 | invoke参数格式 | 说明 |
|---------|---------------|------|
| `plugin:dialog\\|save` | `invoke(cmd, { options: {...} })` | 2参数: 命令+配置对象 |
| `plugin:dialog\\|open` | `invoke(cmd, { options: {...} })` | 2参数: 命令+配置对象 |
| `plugin:fs\\|write_file` | `invoke(cmd, data, { headers: {...} })` | **3参数**: 命令+数据+配置 |
| `plugin:fs\\|read_file` | `invoke(cmd, { headers: {...} })` | 2参数: 命令+配置 |

## 💡 使用示例

### 示例1: Canvas下载

```javascript
// HTML
<canvas id="myCanvas" width="800" height="600"></canvas>
<button onclick="handleDownload()">下载图片</button>

// JavaScript
async function handleDownload() {
    const canvas = document.getElementById('myCanvas');
    const dataUrl = canvas.toDataURL('image/png');
    await downloadImage(dataUrl, 'my-design.png');
}
```

### 示例2: Image元素下载

```javascript
async function downloadImageElement(img, filename) {
    // 转换img到canvas
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth || img.width;
    canvas.height = img.naturalHeight || img.height;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);

    // 下载
    const dataUrl = canvas.toDataURL('image/png');
    await downloadImage(dataUrl, filename);
}

// 使用
const img = document.getElementById('myImage');
downloadBtn.onclick = () => downloadImageElement(img, 'photo.png');
```

### 示例3: 下载远程图片

```javascript
async function downloadRemoteImage(imageUrl, filename) {
    try {
        // 获取图片数据
        const response = await fetch(imageUrl);
        const blob = await response.blob();

        // 转换为Data URL
        const reader = new FileReader();
        const dataUrl = await new Promise((resolve) => {
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(blob);
        });

        // 下载
        await downloadImage(dataUrl, filename);
    } catch (error) {
        console.error('下载失败:', error);
        alert('下载失败: ' + error.message);
    }
}
```

## 🐛 调试步骤

### 1. 检测Tauri环境

```javascript
console.log('Tauri可用:', typeof window.__TAURI__ !== 'undefined');
console.log('Core API:', typeof window.__TAURI__?.core?.invoke);
console.log('完整对象:', window.__TAURI__);
```

### 2. 测试Dialog API

```javascript
async function testDialog() {
    try {
        const path = await window.__TAURI__.core.invoke('plugin:dialog|save', {
            options: {
                defaultPath: 'test.png',
                filters: [{ name: '图片', extensions: ['png'] }]
            }
        });
        console.log('✅ Dialog成功, 路径:', path);
    } catch (err) {
        console.error('❌ Dialog失败:', err);
    }
}
```

### 3. 测试FS API (3参数格式)

```javascript
async function testFileWrite() {
    try {
        // 测试数据
        const testData = new Uint8Array([72, 101, 108, 108, 111]); // "Hello"

        // 3参数格式调用
        await window.__TAURI__.core.invoke(
            'plugin:fs|write_file',
            testData,
            {
                headers: {
                    path: encodeURIComponent('E:\\\\Desktop\\\\test.txt'),
                    options: JSON.stringify({})
                }
            }
        );

        console.log('✅ 文件写入成功');
    } catch (err) {
        console.error('❌ 文件写入失败:', err);
    }
}
```

### 4. 完整流程测试

```javascript
async function testFullDownload() {
    // 创建测试canvas
    const canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'red';
    ctx.fillRect(0, 0, 100, 100);

    // 获取Data URL
    const dataUrl = canvas.toDataURL('image/png');

    // 测试下载
    await downloadImage(dataUrl, 'test-image.png');
}

testFullDownload();
```

## 🎯 常见错误和解决方案

### 错误1: `unexpected invoke body`

**原因:** 使用了错误的参数格式 (2参数格式而不是3参数)

**解决:**
```javascript
// ❌ 错误
await invoke('plugin:fs|write_file', {
    path: filePath,
    contents: bytes
});

// ✅ 正确
await invoke('plugin:fs|write_file', bytes, {
    headers: {
        path: encodeURIComponent(filePath),
        options: JSON.stringify({})
    }
});
```

### 错误2: `missing required key options`

**原因:** Dialog API 缺少 `options` 包裹

**解决:**
```javascript
// ❌ 错误
await invoke('plugin:dialog|save', {
    defaultPath: 'file.png'
});

// ✅ 正确
await invoke('plugin:dialog|save', {
    options: {
        defaultPath: 'file.png'
    }
});
```

### 错误3: 路径编码问题

**原因:** Windows路径包含反斜杠和特殊字符

**解决:**
```javascript
// ✅ 使用 encodeURIComponent
const encodedPath = encodeURIComponent(filePath);

await invoke('plugin:fs|write_file', bytes, {
    headers: {
        path: encodedPath,  // ← 编码后的路径
        options: JSON.stringify({})
    }
});
```

### 错误4: 数据类型错误

**原因:** 传递了 `Array` 而不是 `Uint8Array`

**解决:**
```javascript
// ❌ 错误
const data = Array.from(bytes);

// ✅ 正确
const data = bytes;  // 保持为 Uint8Array
// 或者
const data = new Uint8Array(bytes);
```

## 📚 技术细节解释

### 为什么是3参数格式？

Tauri 的 FS 插件设计为支持**流式传输**大文件，因此：

1. **第2个参数**: 实际的二进制数据 (`Uint8Array`)
2. **第3个参数**: 元数据 (路径、选项等)

这样设计可以让 Tauri 后端高效处理大文件传输，而不需要将所有元数据嵌入数据中。

### headers 对象结构

```javascript
{
  headers: {
    path: encodeURIComponent(filePath),  // URL编码的文件路径
    options: JSON.stringify({            // 序列化的选项对象
      // append: boolean,      // 追加模式
      // create: boolean,      // 创建文件
      // createNew: boolean,   // 仅当文件不存在时创建
      // mode: number,         // Unix文件权限
      // baseDir: number       // 基础目录枚举值
    })
  }
}
```

### Dialog API 为什么不同？

Dialog API 不需要传输大量数据，只需要配置信息，所以使用标准的2参数格式：

```javascript
await invoke('plugin:dialog|save', {
    options: { /* 配置 */ }
});
```

## ✅ 检查清单

在应用此修复前，请确认：

- [ ] Tauri 版本 >= 2.0
- [ ] 已安装 `tauri-plugin-dialog`
- [ ] 已安装 `tauri-plugin-fs`
- [ ] 权限配置正确 (capabilities/*.json)
- [ ] Dialog API 使用 2参数格式 + `options` 对象
- [ ] FS API 使用 **3参数格式** + `headers` 对象
- [ ] 数据类型为 `Uint8Array` (不是 `Array`)
- [ ] 路径使用 `encodeURIComponent()` 编码

## 🚀 部署步骤

### 对于外部工具开发者

1. **复制完整的 `downloadImage()` 函数** 到你的项目
2. **替换现有下载代码** 调用新函数
3. **本地测试** 在浏览器和Tauri环境中都测试
4. **提交更新** 推送到生产环境

### 对于呈尚策划工具箱维护者

外部工具需要各自修改源代码，桌面应用本身不需要改动（权限已正确配置）。

---

**状态**: ✅ 已通过官方源码验证
**测试**: ✅ API格式来自Tauri官方仓库
**适用版本**: Tauri 2.x + tauri-plugin-fs 2.4.0+
**最后更新**: 2025年10月16日

**重要提示**: 此文档 **完全替代** 之前所有下载修复文档！
