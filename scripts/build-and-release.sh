#!/bin/bash

# 呈尚策划工具箱自动化构建和发布脚本
# 使用方法: ./build-and-release.sh 1.2.0 "版本更新说明"

set -e  # 遇到错误立即退出

VERSION=$1
RELEASE_NOTES=$2

if [ -z "$VERSION" ] || [ -z "$RELEASE_NOTES" ]; then
    echo "使用方法: $0 <版本号> <版本说明>"
    echo "示例: $0 1.2.0 '修复bug和性能优化'"
    exit 1
fi

echo "🚀 开始构建呈尚策划工具箱 v$VERSION"

# 1. 检查环境变量
if [ -z "$TAURI_PRIVATE_KEY" ]; then
    echo "❌ 错误: 未设置 TAURI_PRIVATE_KEY 环境变量"
    exit 1
fi

# 2. 更新版本号
echo "📝 更新版本号到 $VERSION"
npm version $VERSION --no-git-tag-version
cd src-tauri
cargo update
cd ..

# 3. 构建前端
echo "🏗️ 构建前端应用..."
npm run build

# 4. 构建桌面应用
echo "🏗️ 构建桌面应用..."
npm run tauri build

# 5. 生成签名
echo "✍️ 生成数字签名..."
BUNDLE_PATH="src-tauri/target/release/bundle/nsis/呈尚策划工具箱_${VERSION}_x64-setup.exe"

if [ ! -f "$BUNDLE_PATH" ]; then
    echo "❌ 错误: 构建文件不存在: $BUNDLE_PATH"
    exit 1
fi

# 生成签名
SIGNATURE=$(tauri signer sign "$BUNDLE_PATH" -p "$TAURI_PRIVATE_KEY" | grep "Signature:" | cut -d' ' -f2)

echo "✅ 构建完成！"
echo "📦 安装包: $BUNDLE_PATH"
echo "🔐 签名: $SIGNATURE"

# 6. 上传到服务器 (这里需要根据你的服务器配置)
echo "📤 上传发布文件..."

# 示例：上传到阿里云OSS (需要安装ossutil)
# ossutil cp "$BUNDLE_PATH" "oss://your-bucket/releases/呈尚策划工具箱-${VERSION}-setup.exe"

# 7. 更新版本信息到更新服务器
echo "📡 更新版本信息..."
curl -X POST https://api.chengshangcehua.com/api/admin/releases \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d "{
    \"target\": \"windows-x86_64\",
    \"version\": \"$VERSION\",
    \"notes\": \"$RELEASE_NOTES\",
    \"signature\": \"$SIGNATURE\",
    \"url\": \"https://releases.chengshangcehua.com/呈尚策划工具箱-${VERSION}-setup.exe\"
  }"

echo "🎉 发布完成！版本 $VERSION 已成功发布"