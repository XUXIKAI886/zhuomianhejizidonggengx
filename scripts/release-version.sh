#!/bin/bash

# 自动更新版本发布脚本
# 使用方法: ./release-version.sh 1.0.10 "版本更新说明"

set -e

VERSION=$1
RELEASE_NOTES=$2

if [ -z "$VERSION" ] || [ -z "$RELEASE_NOTES" ]; then
    echo "❌ 用法: $0 <版本号> <更新说明>"
    echo "示例: $0 1.0.10 '修复关键bug，提升性能'"
    exit 1
fi

echo "🚀 开始发布版本 v$VERSION"

# 1. 更新 Tauri 配置文件版本号
echo "📝 更新 Tauri 配置文件..."
sed -i "s/\"version\": \".*\"/\"version\": \"$VERSION\"/" src-tauri/tauri.conf.json

# 2. 更新 package.json 版本号
echo "📝 更新 package.json..."
sed -i "s/\"version\": \".*\"/\"version\": \"$VERSION\"/" package.json

# 3. 构建应用
echo "🔨 构建应用..."
npm run tauri:build

# 4. 创建 Git 标签
echo "🏷️ 创建 Git 标签..."
git add .
git commit -m "chore: bump version to v$VERSION" || true
git tag "v$VERSION"
git push origin main
git push origin "v$VERSION"

# 5. 更新服务器版本数据
echo "🌐 更新服务器版本数据..."
CURRENT_DATE=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
SIGNATURE="dW50cnVzdGVkIGNvbW1lbnQ6IHNpZ25hdHVyZSBmcm9tIHRhdXJpIHNlY3JldCBrZXkKUlVUNDJSNXU5VWZ4SGFuZGxlciBBcHBsaWNhdGlvbgpSV1NCQU8zdDA4anVKc2I2YTBGQVNBVnhzV3J1MjBJMXJhcEtnNm1RRUNBTGczZ1FBQVJZSTFNRVowNlNUYWVJcw=="
DOWNLOAD_URL="https://github.com/XUXIKAI886/zhuomianhejizidonggengx/releases/download/v$VERSION/csch_${VERSION}_x64-setup.exe"

# 创建静态版本文件
cat > "static-update-server/windows-x86_64/$VERSION.json" << EOF
{
  "version": "$VERSION",
  "notes": "$RELEASE_NOTES",
  "pub_date": "$CURRENT_DATE",
  "platforms": {
    "windows-x86_64": {
      "signature": "$SIGNATURE",
      "url": "$DOWNLOAD_URL"
    }
  }
}
EOF

echo "✅ 版本发布完成！"
echo ""
echo "📋 接下来请手动完成："
echo "1. 在 GitHub 上创建 Release v$VERSION"
echo "2. 上传构建的安装包: target/release/bundle/nsis/csch_${VERSION}_x64-setup.exe"
echo "3. 部署更新的服务器文件到 Vercel"
echo "4. 测试自动更新功能是否正常"
echo ""
echo "🔗 GitHub Releases: https://github.com/XUXIKAI886/zhuomianhejizidonggengx/releases"