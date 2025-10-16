#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 跨平台文件操作函数
function moveDirectory(src, dest) {
  if (fs.existsSync(src)) {
    // 确保目标目录存在
    const destDir = path.dirname(dest);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }

    // 如果目标已存在，先删除
    if (fs.existsSync(dest)) {
      fs.rmSync(dest, { recursive: true, force: true });
    }

    // 复制目录
    fs.cpSync(src, dest, { recursive: true });
    // 删除源目录
    fs.rmSync(src, { recursive: true, force: true });
    return true;
  }
  return false;
}

console.log('🚀 开始Tauri智能构建流程...\n');

// 步骤1: 备份API路由
console.log('📁 步骤1: 备份API路由...');
const apiPath = 'app/api';
const backupPath = 'api_backup';

if (fs.existsSync(apiPath)) {
  // 移动API目录到备份位置
  if (moveDirectory(apiPath, path.join(backupPath, 'api'))) {
    console.log('✅ API路由已备份到 api_backup/api');
  } else {
    console.log('❌ API路由备份失败');
    process.exit(1);
  }
} else {
  console.log('⏭️  API路由不存在，跳过备份');
}

// 步骤2: 执行Next.js构建
console.log('\n🔨 步骤2: 执行Next.js构建...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Next.js构建成功');
} catch (error) {
  console.error('❌ Next.js构建失败');
  // 恢复API路由
  if (fs.existsSync(path.join(backupPath, 'api'))) {
    moveDirectory(path.join(backupPath, 'api'), apiPath);
    console.log('🔄 已恢复API路由');
  }
  process.exit(1);
}

// 步骤3: 执行Tauri构建
console.log('\n⚡ 步骤3: 执行Tauri构建...');
try {
  execSync('tauri build --no-bundle', { stdio: 'inherit' });
  console.log('✅ Tauri构建成功');
} catch (error) {
  console.error('❌ Tauri构建失败');
  // 恢复API路由
  if (fs.existsSync(path.join(backupPath, 'api'))) {
    moveDirectory(path.join(backupPath, 'api'), apiPath);
    console.log('🔄 已恢复API路由');
  }
  process.exit(1);
}

// 步骤4: 恢复API路由
console.log('\n🔄 步骤4: 恢复API路由...');
if (fs.existsSync(path.join(backupPath, 'api'))) {
  moveDirectory(path.join(backupPath, 'api'), apiPath);
  console.log('✅ API路由已恢复');

  // 清理备份目录
  if (fs.existsSync(backupPath)) {
    fs.rmSync(backupPath, { recursive: true, force: true });
    console.log('🧹 备份目录已清理');
  }
} else {
  console.log('⏭️  无需恢复API路由');
}

console.log('\n🎉 Tauri构建流程完成！');
console.log('📦 安装包位置: src-tauri/target/release/app.exe');
console.log('💡 提示: 开发环境中所有功能都可正常使用');
