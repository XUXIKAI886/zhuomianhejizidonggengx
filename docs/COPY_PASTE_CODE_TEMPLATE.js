/**
 * ==========================================
 * Tauri文件对话框 - 复制粘贴代码模板
 * ==========================================
 *
 * 使用说明：
 * 1. 将本文件的代码复制到您的JavaScript文件开头
 * 2. 按照步骤1-3修改您的按钮事件处理代码
 * 3. 根据需要修改步骤4的文件处理逻辑
 *
 * ==========================================
 */

// ==========================================
// 第一部分：核心函数（必需 - 完整复制）
// ==========================================

/**
 * 检测是否运行在Tauri桌面应用环境中
 * @returns {boolean} 如果在Tauri环境中返回true，否则返回false
 */
function isTauriEnvironment() {
    return typeof window.__TAURI__ !== 'undefined';
}

/**
 * 统一的文件选择函数 - 自动适配Tauri和浏览器环境
 * @param {Object} options - 文件选择配置项
 * @param {boolean} options.multiple - 是否允许多选（默认false）
 * @param {boolean} options.directory - 是否选择文件夹（默认false）
 * @param {string} options.title - 对话框标题（默认"选择文件"）
 * @param {Array} options.filters - 文件类型过滤器数组
 * @returns {Promise} 返回选中的文件或文件路径
 *
 * 示例：
 * const file = await selectFile({
 *     multiple: false,
 *     filters: [{ name: 'Excel', extensions: ['xlsx', 'xls'] }],
 *     title: '选择监控文件'
 * });
 */
async function selectFile(options = {}) {
    const config = {
        multiple: options.multiple || false,
        directory: options.directory || false,
        title: options.title || '选择文件',
        filters: options.filters || []
    };

    console.log('📂 文件选择配置:', config);

    if (isTauriEnvironment()) {
        // Tauri桌面应用环境
        console.log('🖥️ 使用Tauri Dialog API');
        return await selectFileInTauri(config);
    } else {
        // 普通浏览器环境
        console.log('🌐 使用HTML Input');
        return await selectFileInBrowser(config);
    }
}

/**
 * Tauri环境下的文件选择实现
 */
async function selectFileInTauri(config) {
    try {
        const result = await window.__TAURI__.core.invoke('plugin:dialog|open', {
            options: config
        });

        if (result) {
            console.log('✅ 文件选择成功:', result);
            return result;
        } else {
            console.log('❌ 用户取消了选择');
            return null;
        }
    } catch (error) {
        console.error('❌ Tauri文件选择失败:', error);
        alert('文件选择失败: ' + error.message);
        return null;
    }
}

/**
 * 浏览器环境下的文件选择实现
 */
async function selectFileInBrowser(config) {
    return new Promise((resolve) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.multiple = config.multiple;

        // 设置文件类型过滤器
        if (config.filters && config.filters.length > 0) {
            const accept = config.filters
                .map(filter => filter.extensions.map(ext => '.' + ext).join(','))
                .join(',');
            input.accept = accept;
        }

        input.onchange = (e) => {
            const files = e.target.files;
            if (files && files.length > 0) {
                console.log('✅ 文件选择成功');
                resolve(config.multiple ? Array.from(files) : files[0]);
            } else {
                console.log('❌ 用户取消了选择');
                resolve(null);
            }
        };

        input.click();
    });
}

/**
 * 处理选中的文件 - 自动适配不同环境
 * @param {string|File|Array} fileOrPath - 文件路径（Tauri）或File对象（浏览器）
 */
async function handleSelectedFile(fileOrPath) {
    if (!fileOrPath) {
        console.log('未选择文件');
        return;
    }

    console.log('📄 处理文件:', fileOrPath);

    // 处理单个文件
    if (typeof fileOrPath === 'string') {
        // Tauri环境 - 文件路径字符串
        await handleFileFromTauri(fileOrPath);
    } else if (fileOrPath instanceof File) {
        // 浏览器环境 - File对象
        await handleFileFromBrowser(fileOrPath);
    } else if (Array.isArray(fileOrPath)) {
        // 多文件选择
        console.log('处理多个文件，数量:', fileOrPath.length);
        for (const item of fileOrPath) {
            await handleSelectedFile(item);
        }
    } else {
        console.error('❌ 未知的文件类型');
    }
}

/**
 * 处理来自Tauri的文件路径
 */
async function handleFileFromTauri(filePath) {
    try {
        console.log('🖥️ Tauri文件路径:', filePath);

        // 方式1：读取文本文件
        if (window.__TAURI__ && window.__TAURI__.fs) {
            const content = await window.__TAURI__.fs.readTextFile(filePath);
            console.log('✅ 文件读取成功，大小:', content.length);
            processFileContent(content, filePath);
        } else {
            console.warn('⚠️ fs插件未启用，无法读取文件内容');
            processFilePath(filePath);
        }

        // 方式2：读取二进制文件（如Excel）
        // const bytes = await window.__TAURI__.fs.readBinaryFile(filePath);
        // const arrayBuffer = bytes.buffer;
        // processFileContent(arrayBuffer, filePath);

    } catch (error) {
        console.error('❌ 读取文件失败:', error);
        alert('读取文件失败: ' + error.message);
    }
}

/**
 * 处理来自浏览器的File对象
 */
async function handleFileFromBrowser(file) {
    try {
        console.log('🌐 浏览器文件:', file.name, '大小:', file.size);

        const reader = new FileReader();

        reader.onload = function(e) {
            const content = e.target.result;
            console.log('✅ 文件读取成功');
            processFileContent(content, file.name);
        };

        reader.onerror = function(e) {
            console.error('❌ 读取文件失败:', e);
            alert('读取文件失败');
        };

        // 读取文本文件
        reader.readAsText(file);

        // 或读取二进制文件（如Excel）
        // reader.readAsArrayBuffer(file);

    } catch (error) {
        console.error('❌ 处理文件失败:', error);
        alert('处理文件失败: ' + error.message);
    }
}

// ==========================================
// 第二部分：业务逻辑（需要您自定义）
// ==========================================

/**
 * 处理文件路径（仅在Tauri中且fs插件未启用时使用）
 * @param {string} filePath - 文件完整路径
 */
function processFilePath(filePath) {
    console.log('📍 处理文件路径:', filePath);

    // TODO: 在这里添加您的业务逻辑
    // 例如：显示文件路径、发送到服务器等

    alert('已选择文件: ' + filePath);
}

/**
 * 处理文件内容（您的核心业务逻辑）
 * @param {string|ArrayBuffer} content - 文件内容
 * @param {string} fileName - 文件名或路径
 */
function processFileContent(content, fileName) {
    console.log('⚙️ 处理文件内容:', fileName);

    // TODO: 在这里添加您的业务逻辑
    // 例如：解析Excel、处理JSON、显示图片等

    // 示例：显示文本内容
    console.log('文件内容预览:', content.substring(0, 100) + '...');

    // 示例：使用第三方库解析Excel
    // if (fileName.endsWith('.xlsx')) {
    //     const workbook = XLSX.read(content, { type: 'array' });
    //     console.log('Excel表格:', workbook);
    // }

    alert('文件处理完成！');
}

// ==========================================
// 第三部分：使用示例（参考修改）
// ==========================================

/**
 * 示例1：选择单个Excel文件
 */
function example1_SelectExcelFile() {
    document.getElementById('selectExcelBtn').addEventListener('click', async function() {
        const file = await selectFile({
            multiple: false,
            filters: [
                { name: 'Excel文件', extensions: ['xlsx', 'xls'] },
                { name: 'CSV文件', extensions: ['csv'] },
                { name: '所有文件', extensions: ['*'] }
            ],
            title: '选择Excel监控文件'
        });

        if (file) {
            await handleSelectedFile(file);
        }
    });
}

/**
 * 示例2：选择多个图片文件
 */
function example2_SelectMultipleImages() {
    document.getElementById('selectImagesBtn').addEventListener('click', async function() {
        const files = await selectFile({
            multiple: true,
            filters: [
                { name: '图片', extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp'] }
            ],
            title: '选择图片（可多选）'
        });

        if (files) {
            await handleSelectedFile(files);
        }
    });
}

/**
 * 示例3：选择文件夹
 */
function example3_SelectFolder() {
    document.getElementById('selectFolderBtn').addEventListener('click', async function() {
        const folder = await selectFile({
            directory: true,
            title: '选择输出文件夹'
        });

        if (folder) {
            console.log('选中的文件夹:', folder);
            alert('已选择文件夹: ' + folder);
        }
    });
}

/**
 * 示例4：替换原有的file input点击逻辑
 */
function example4_ReplaceOriginalLogic() {
    // 原代码：
    // document.getElementById('selectBtn').addEventListener('click', function() {
    //     document.getElementById('fileInput').click();
    // });
    //
    // document.getElementById('fileInput').addEventListener('change', function(e) {
    //     const file = e.target.files[0];
    //     processFile(file);
    // });

    // 新代码：
    document.getElementById('selectBtn').addEventListener('click', async function() {
        const file = await selectFile({
            multiple: false,
            filters: [
                { name: 'Excel', extensions: ['xlsx', 'xls', 'csv'] }
            ]
        });

        if (file) {
            await handleSelectedFile(file);
        }
    });
}

// ==========================================
// 第四部分：初始化（在DOMContentLoaded时调用）
// ==========================================

window.addEventListener('DOMContentLoaded', function() {
    // 显示当前运行环境
    if (isTauriEnvironment()) {
        console.log('✅ 当前运行在Tauri桌面应用环境');
    } else {
        console.log('🌐 当前运行在普通浏览器环境');
    }

    // TODO: 在这里调用您的初始化函数
    // 例如：example1_SelectExcelFile();
});

// ==========================================
// 第五部分：常用过滤器配置（复制使用）
// ==========================================

const COMMON_FILTERS = {
    // Excel文件
    excel: [
        { name: 'Excel文件', extensions: ['xlsx', 'xls'] },
        { name: 'CSV文件', extensions: ['csv'] }
    ],

    // 图片文件
    images: [
        { name: '图片', extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'] }
    ],

    // 文本文件
    text: [
        { name: '文本文件', extensions: ['txt', 'md', 'json', 'xml', 'yaml', 'yml'] }
    ],

    // PDF文件
    pdf: [
        { name: 'PDF文件', extensions: ['pdf'] }
    ],

    // 压缩文件
    archives: [
        { name: '压缩文件', extensions: ['zip', 'rar', '7z', 'tar', 'gz'] }
    ],

    // 所有文件
    all: [
        { name: '所有文件', extensions: ['*'] }
    ],

    // 多种类型组合
    excelAndImages: [
        { name: 'Excel', extensions: ['xlsx', 'xls'] },
        { name: '图片', extensions: ['jpg', 'png'] },
        { name: '所有文件', extensions: ['*'] }
    ]
};

// 使用示例：
// const file = await selectFile({
//     filters: COMMON_FILTERS.excel,
//     title: '选择Excel文件'
// });

// ==========================================
// 使用说明总结
// ==========================================

/*
1. 复制第一部分的核心函数到您的JS文件

2. 找到您原来的按钮点击事件，例如：
   document.getElementById('selectFileBtn').addEventListener('click', function() {
       document.getElementById('fileInput').click();
   });

3. 替换为：
   document.getElementById('selectFileBtn').addEventListener('click', async function() {
       const file = await selectFile({
           multiple: false,
           filters: [{ name: 'Excel', extensions: ['xlsx', 'xls'] }],
           title: '选择监控文件'
       });

       if (file) {
           await handleSelectedFile(file);
       }
   });

4. 在processFileContent()函数中添加您的业务逻辑

5. 测试：
   - 在浏览器中打开，确保正常
   - 在Tauri桌面应用中打开，确保正常

完成！
*/
