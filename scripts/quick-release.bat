@echo off
REM 呈尚策划工具箱快速发布脚本 (Windows)
REM 使用方法: quick-release.bat 1.2.0 "版本更新说明"

set VERSION=%1
set RELEASE_NOTES=%2

if "%VERSION%"=="" (
    echo 使用方法: %0 ^<版本号^> ^<版本说明^>
    echo 示例: %0 1.2.0 "修复bug和性能优化"
    exit /b 1
)

if "%RELEASE_NOTES%"=="" (
    echo 使用方法: %0 ^<版本号^> ^<版本说明^>
    echo 示例: %0 1.2.0 "修复bug和性能优化"
    exit /b 1
)

echo 🚀 开始构建呈尚策划工具箱 v%VERSION%

REM 检查环境变量
if "%TAURI_PRIVATE_KEY%"=="" (
    echo ❌ 错误: 未设置 TAURI_PRIVATE_KEY 环境变量
    echo 请运行: set TAURI_PRIVATE_KEY=你的私钥内容
    exit /b 1
)

REM 更新版本号
echo 📝 更新版本号到 %VERSION%
call npm version %VERSION% --no-git-tag-version

REM 构建前端
echo 🏗️ 构建前端应用...
call npm run build
if errorlevel 1 (
    echo ❌ 前端构建失败
    exit /b 1
)

REM 构建桌面应用  
echo 🏗️ 构建桌面应用...
call npm run tauri build
if errorlevel 1 (
    echo ❌ 桌面应用构建失败
    exit /b 1
)

echo ✅ 构建完成！

REM 查找生成的安装包
for /r "src-tauri\target\release\bundle\nsis" %%f in (*setup.exe) do (
    set BUNDLE_PATH=%%f
    echo 📦 安装包: %%f
)

if "%BUNDLE_PATH%"=="" (
    echo ❌ 错误: 未找到构建的安装包
    exit /b 1
)

echo 🎉 发布完成！
echo 版本: %VERSION%
echo 文件: %BUNDLE_PATH%
echo.
echo 接下来请手动：
echo 1. 将安装包上传到服务器
echo 2. 使用 tauri signer sign 生成签名
echo 3. 更新版本信息到更新服务器

pause