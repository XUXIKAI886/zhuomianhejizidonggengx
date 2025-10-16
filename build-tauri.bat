@echo off
echo 🚀 开始Tauri智能构建流程...
echo.

echo 📁 步骤1: 备份API路由...
if exist app\api (
    if exist api_backup rmdir /s /q api_backup
    mkdir api_backup
    xcopy app\api api_backup\api\ /e /i /q
    rmdir /s /q app\api
    echo ✅ API路由已备份到 api_backup\api
) else (
    echo ⏭️  API路由不存在，跳过备份
)

echo.
echo 🔨 步骤2: 清理缓存...
if exist .next rmdir /s /q .next
if exist out rmdir /s /q out
echo ✅ 缓存已清理

echo.
echo 🔨 步骤3: 执行Next.js构建...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Next.js构建失败
    goto restore_api
)
echo ✅ Next.js构建成功

echo.
echo ⚡ 步骤4: 执行Tauri构建...
call tauri build
if %errorlevel% neq 0 (
    echo ❌ Tauri构建失败
    goto restore_api
)
echo ✅ Tauri构建成功

:restore_api
echo.
echo 🔄 步骤5: 恢复API路由...
if exist api_backup\api (
    xcopy api_backup\api app\api\ /e /i /q
    rmdir /s /q api_backup
    echo ✅ API路由已恢复
) else (
    echo ⏭️  无需恢复API路由
)

echo.
echo 🎉 Tauri构建流程完成！
echo 📦 安装包位置: src-tauri\target\release\bundle\nsis\
echo 💡 提示: 开发环境中所有功能都可正常使用
pause
