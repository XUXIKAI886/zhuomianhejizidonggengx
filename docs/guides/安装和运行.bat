@echo off
chcp 65001 >nul
echo ================================
echo 呈尚策划工具箱 - 依赖检查和启动
echo ================================
echo.

:: 检查系统架构
if "%PROCESSOR_ARCHITECTURE%"=="x86" (
    echo ❌ 错误：此应用需要64位Windows系统
    echo 您的系统是32位，无法运行此应用
    pause
    exit /b 1
)

:: 检查Windows版本
for /f "tokens=4-5 delims=. " %%i in ('ver') do set VERSION=%%i.%%j
if "%VERSION%" lss "10.0" (
    echo ❌ 警告：建议使用Windows 10或更高版本
    echo 当前系统可能缺少WebView2运行时
    echo.
)

:: 检查WebView2
echo 🔍 检查WebView2运行时...
reg query "HKLM\SOFTWARE\WOW6432Node\Microsoft\EdgeUpdate\Clients\{F3017226-FE2A-4295-8BDF-00C3A9A7E4C5}" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ WebView2运行时已安装
) else (
    echo ❌ 未检测到WebView2运行时
    echo.
    echo 请选择操作：
    echo 1. 自动下载并安装WebView2
    echo 2. 手动下载（推荐）
    echo 3. 忽略并尝试运行
    echo.
    set /p choice=请输入选择 (1-3): 
    
    if "!choice!"=="1" (
        echo 正在下载WebView2...
        powershell -Command "Invoke-WebRequest -Uri 'https://go.microsoft.com/fwlink/p/?LinkId=2124703' -OutFile 'MicrosoftEdgeWebview2Setup.exe'"
        if exist "MicrosoftEdgeWebview2Setup.exe" (
            echo 正在安装WebView2...
            MicrosoftEdgeWebview2Setup.exe /silent /install
            del "MicrosoftEdgeWebview2Setup.exe"
        )
    ) else if "!choice!"=="2" (
        echo 请访问以下链接下载WebView2：
        echo https://developer.microsoft.com/microsoft-edge/webview2/
        echo.
        echo 下载完成后请重新运行此脚本
        pause
        exit /b 0
    )
)

echo.
echo 🚀 启动呈尚策划工具箱...
echo.

:: 检查app.exe是否存在
if not exist "app.exe" (
    if exist "src-tauri\target\release\app.exe" (
        echo 从构建目录复制应用程序...
        copy "src-tauri\target\release\app.exe" "app.exe" >nul
    ) else (
        echo ❌ 错误：找不到app.exe文件
        echo 请确保文件在正确的位置
        pause
        exit /b 1
    )
)

:: 启动应用
start "" "app.exe"

if %errorlevel% equ 0 (
    echo ✅ 应用启动成功！
    echo.
    echo 如果遇到问题，请检查：
    echo 1. 系统是否为Windows 10/11 64位
    echo 2. 是否已安装WebView2运行时
    echo 3. 防火墙是否阻止了应用运行
) else (
    echo ❌ 应用启动失败
    echo 错误代码: %errorlevel%
    echo.
    echo 可能的解决方案：
    echo 1. 以管理员身份运行此脚本
    echo 2. 检查防病毒软件是否阻止
    echo 3. 安装Visual C++ Redistributable
)

echo.
pause
