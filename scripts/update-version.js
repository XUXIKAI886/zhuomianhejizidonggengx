#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * 自动更新项目版本号脚本
 * 使用方法: node scripts/update-version.js 1.1.0
 */

const newVersion = process.argv[2];

if (!newVersion) {
    console.error('❌ 错误: 请提供新版本号');
    console.log('使用方法: node scripts/update-version.js 1.1.0');
    process.exit(1);
}

// 验证版本号格式 (语义化版本)
const versionRegex = /^\d+\.\d+\.\d+(-[a-zA-Z0-9-]+)?$/;
if (!versionRegex.test(newVersion)) {
    console.error('❌ 错误: 版本号格式不正确');
    console.log('正确格式: 1.0.0 或 1.0.0-beta.1');
    process.exit(1);
}

console.log(`🚀 开始更新版本号到 ${newVersion}...`);
console.log('');

// 需要更新的文件列表
const filesToUpdate = [
    {
        path: 'package.json',
        update: (content) => {
            const pkg = JSON.parse(content);
            const oldVersion = pkg.version;
            pkg.version = newVersion;
            console.log(`📦 package.json: ${oldVersion} → ${newVersion}`);
            return JSON.stringify(pkg, null, 2);
        }
    },
    {
        path: 'src-tauri/tauri.conf.json',
        update: (content) => {
            const config = JSON.parse(content);
            const oldVersion = config.version;
            config.version = newVersion;
            console.log(`⚙️  tauri.conf.json: ${oldVersion} → ${newVersion}`);
            return JSON.stringify(config, null, 2);
        }
    },
    {
        path: 'src-tauri/Cargo.toml',
        update: (content) => {
            const versionMatch = content.match(/version = "([^"]+)"/);
            const oldVersion = versionMatch ? versionMatch[1] : 'unknown';
            const updated = content.replace(/version = "[\d\.]+"/, `version = "${newVersion}"`);
            console.log(`🦀 Cargo.toml: ${oldVersion} → ${newVersion}`);
            return updated;
        }
    }
];

// 更新文件
let updateCount = 0;
let errorCount = 0;

filesToUpdate.forEach(({ path: filePath, update }) => {
    try {
        if (!fs.existsSync(filePath)) {
            console.log(`⚠️  跳过: ${filePath} (文件不存在)`);
            return;
        }

        const content = fs.readFileSync(filePath, 'utf8');
        const updatedContent = update(content);
        fs.writeFileSync(filePath, updatedContent);
        updateCount++;
    } catch (error) {
        console.error(`❌ 更新失败: ${filePath}`);
        console.error(`   错误: ${error.message}`);
        errorCount++;
    }
});

console.log('');

// 更新CHANGELOG.md
const changelogPath = '文档/CHANGELOG.md';
if (fs.existsSync(changelogPath)) {
    try {
        const changelog = fs.readFileSync(changelogPath, 'utf8');
        const today = new Date().toISOString().split('T')[0];
        
        const newEntry = `## [${newVersion}] - ${today}

### 新增
- 

### 修复
- 

### 改进
- 

`;

        // 在第一个版本条目前插入新版本
        const versionHeaderRegex = /^## \[/m;
        const insertIndex = changelog.search(versionHeaderRegex);
        
        let updatedChangelog;
        if (insertIndex !== -1) {
            updatedChangelog = changelog.slice(0, insertIndex) + newEntry + changelog.slice(insertIndex);
        } else {
            // 如果没有找到版本条目，添加到文件末尾
            updatedChangelog = changelog + '\n' + newEntry;
        }
        
        fs.writeFileSync(changelogPath, updatedChangelog);
        console.log(`📝 CHANGELOG.md: 已添加 v${newVersion} 条目`);
        updateCount++;
    } catch (error) {
        console.error(`❌ 更新CHANGELOG失败: ${error.message}`);
        errorCount++;
    }
}

// 生成版本信息文件
const versionInfoPath = 'src/version.json';
try {
    const versionInfo = {
        version: newVersion,
        buildDate: new Date().toISOString(),
        buildNumber: Date.now()
    };
    
    // 确保目录存在
    const dir = path.dirname(versionInfoPath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(versionInfoPath, JSON.stringify(versionInfo, null, 2));
    console.log(`ℹ️  版本信息: 已生成 ${versionInfoPath}`);
    updateCount++;
} catch (error) {
    console.error(`❌ 生成版本信息失败: ${error.message}`);
    errorCount++;
}

// 输出结果
console.log('');
console.log('📊 更新结果:');
console.log(`   ✅ 成功: ${updateCount} 个文件`);
if (errorCount > 0) {
    console.log(`   ❌ 失败: ${errorCount} 个文件`);
}

if (errorCount === 0) {
    console.log('');
    console.log('🎉 版本更新完成！');
    console.log('');
    console.log('📋 下一步操作:');
    console.log('1. 检查并编辑 文档/CHANGELOG.md 中的更新内容');
    console.log('2. 提交代码: git add . && git commit -m "chore: bump version to v' + newVersion + '"');
    console.log('3. 创建标签: git tag v' + newVersion);
    console.log('4. 推送代码: git push && git push --tags');
    console.log('5. 构建发布: npm run tauri:build');
    console.log('');
    console.log('🔧 构建命令:');
    console.log('   npm run tauri:build');
    console.log('');
} else {
    console.log('');
    console.log('⚠️  部分文件更新失败，请手动检查和修复');
    process.exit(1);
}

// 检查是否需要更新依赖
console.log('💡 提示:');
console.log('   - 如果更新了主要版本，考虑更新依赖包');
console.log('   - 记得在CHANGELOG中详细描述变更内容');
console.log('   - 发布前请进行充分测试');
console.log('');
