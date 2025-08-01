#!/bin/bash

# 呈尚策划工具箱自动更新系统部署脚本
# 使用方法: ./deploy-update-server.sh

set -e

echo "🚀 开始部署呈尚策划工具箱自动更新系统..."

# 检查是否在正确的目录
if [ ! -f "src-tauri/tauri.conf.json" ]; then
    echo "❌ 错误: 请在桌面应用项目根目录运行此脚本"
    exit 1
fi

# 检查 Git 状态
if [ ! -d ".git" ]; then
    echo "❌ 错误: 当前目录不是 Git 仓库"
    exit 1
fi

echo "📁 检测到项目结构正确"

# 创建更新服务器目录
echo "📁 创建更新服务器目录..."
mkdir -p update-server/api

# 复制更新服务器文件
echo "📝 复制更新服务器文件..."

# 这里需要手动复制之前创建的文件
echo "⚠️  请手动复制以下文件到项目根目录："
echo "   - update-server/ 目录及其所有内容"
echo "   - GITHUB_VERCEL_DEPLOYMENT_GUIDE.md"

echo "✅ 文件复制完成后，继续执行以下命令："
echo ""
echo "# 1. 添加所有文件到 Git"
echo "git add ."
echo ""
echo "# 2. 提交更改"
echo "git commit -m \"feat: 添加 Vercel 自动更新服务器系统\""
echo ""
echo "# 3. 推送到 GitHub"
echo "git push origin main"
echo ""
echo "# 4. 在 Vercel Dashboard 导入你的 GitHub 仓库"
echo "# 5. 配置环境变量 ADMIN_TOKEN"
echo "# 6. 点击部署"
echo ""
echo "🎉 部署完成后，你的更新服务器将在以下地址运行："
echo "https://zhuomianhejizidonggengx.vercel.app"