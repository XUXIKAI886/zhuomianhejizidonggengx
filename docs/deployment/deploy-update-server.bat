@echo off
REM 呈尚策划工具箱自动更新系统部署脚本 (Windows)
REM 使用方法: deploy-update-server.bat

echo 🚀 开始部署呈尚策划工具箱自动更新系统...

REM 检查是否在正确的目录
if not exist "src-tauri\tauri.conf.json" (
    echo ❌ 错误: 请在桌面应用项目根目录运行此脚本
    pause
    exit /b 1
)

REM 检查 Git 状态
if not exist ".git" (
    echo ❌ 错误: 当前目录不是 Git 仓库
    pause
    exit /b 1
)

echo 📁 检测到项目结构正确

echo.
echo ⚠️  请按照以下步骤完成部署：
echo.
echo 📝 第一步：复制更新服务器文件
echo    将 update-server 目录及其所有内容复制到当前项目根目录
echo.
echo 🔧 第二步：推送到 GitHub
echo    git add .
echo    git commit -m "feat: 添加 Vercel 自动更新服务器系统"
echo    git push origin main
echo.
echo 🌐 第三步：在 Vercel 部署
echo    1. 访问 https://vercel.com/dashboard
echo    2. 点击 "New Project"
echo    3. 导入你的 GitHub 仓库: zhuomianhejizidonggengx
echo    4. 配置环境变量 ADMIN_TOKEN
echo    5. 点击 Deploy
echo.
echo 🎉 部署完成后，你的更新服务器将在以下地址运行：
echo    https://zhuomianhejizidonggengx.vercel.app
echo.
echo 📖 详细部署指南请查看: GITHUB_VERCEL_DEPLOYMENT_GUIDE.md
echo.

pause