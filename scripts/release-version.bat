@echo off
REM 自动更新版本发布脚本 (Windows)
REM 使用方法: release-version.bat 1.0.10 "版本更新说明"

setlocal enabledelayedexpansion

set VERSION=%1
set RELEASE_NOTES=%2

if "%VERSION%"=="" (
    echo ❌ 用法: %0 ^<版本号^> ^<更新说明^>
    echo 示例: %0 1.0.10 "修复关键bug，提升性能"
    exit /b 1
)

if "%RELEASE_NOTES%"=="" (
    echo ❌ 用法: %0 ^<版本号^> ^<更新说明^>
    echo 示例: %0 1.0.10 "修复关键bug，提升性能"
    exit /b 1
)

echo 🚀 开始发布版本 v%VERSION%

REM 1. 更新 Tauri 配置文件版本号
echo 📝 更新 Tauri 配置文件...
powershell -Command "(Get-Content src-tauri\tauri.conf.json) -replace '\"version\": \".*\"', '\"version\": \"%VERSION%\"' | Set-Content src-tauri\tauri.conf.json"

REM 2. 更新 package.json 版本号
echo 📝 更新 package.json...
powershell -Command "(Get-Content package.json) -replace '\"version\": \".*\"', '\"version\": \"%VERSION%\"' | Set-Content package.json"

REM 3. 构建应用
echo 🔨 构建应用...
npm run tauri:build

REM 4. 创建 Git 标签
echo 🏷️ 创建 Git 标签...
git add .
git commit -m "chore: bump version to v%VERSION%" 2>nul
git tag "v%VERSION%"
git push origin main
git push origin "v%VERSION%"

REM 5. 更新服务器版本数据
echo 🌐 更新服务器版本数据...
for /f "tokens=1-6 delims=.: " %%a in ('powershell -Command "Get-Date -Format 'yyyy-MM-ddTHH:mm:ssZ' -AsUTC"') do (
    set CURRENT_DATE=%%a-%%b-%%cT%%d:%%e:%%fZ
)

set SIGNATURE=dW50cnVzdGVkIGNvbW1lbnQ6IHNpZ25hdHVyZSBmcm9tIHRhdXJpIHNlY3JldCBrZXkKUlVUNDJSNXU5VWZ4SGFuZGxlciBBcHBsaWNhdGlvbgpSV1NCQU8zdDA4anVKc2I2YTBGQVNBVnhzV3J1MjBJMXJhcEtnNm1RRUNBTGczZ1FBQVJZSTFNRVowNlNUYWVJcw==
set DOWNLOAD_URL=https://github.com/XUXIKAI886/zhuomianhejizidonggengx/releases/download/v%VERSION%/csch_%VERSION%_x64-setup.exe

REM 创建静态版本文件
(
echo {
echo   "version": "%VERSION%",
echo   "notes": "%RELEASE_NOTES%",
echo   "pub_date": "!CURRENT_DATE!",
echo   "platforms": {
echo     "windows-x86_64": {
echo       "signature": "%SIGNATURE%",
echo       "url": "%DOWNLOAD_URL%"
echo     }
echo   }
echo }
) > "static-update-server\windows-x86_64\%VERSION%.json"

echo ✅ 版本发布完成！
echo.
echo 📋 接下来请手动完成：
echo 1. 在 GitHub 上创建 Release v%VERSION%
echo 2. 上传构建的安装包: target\release\bundle\nsis\csch_%VERSION%_x64-setup.exe
echo 3. 部署更新的服务器文件到 Vercel
echo 4. 测试自动更新功能是否正常
echo.
echo 🔗 GitHub Releases: https://github.com/XUXIKAI886/zhuomianhejizidonggengx/releases

pause