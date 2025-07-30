@echo off
chcp 65001 >nul
echo ================================
echo 呈尚策划工具箱 - 构建清理脚本
echo ================================
echo.

echo 🧹 开始清理构建文件和缓存...
echo.

:: 清理Rust构建缓存
echo 📦 清理Rust构建缓存...
if exist "src-tauri\target" (
    echo   - 删除 src-tauri\target 目录
    rmdir /s /q "src-tauri\target"
    echo   ✅ Rust构建缓存已清理
) else (
    echo   ℹ️ Rust构建缓存不存在，跳过
)

:: 清理Next.js构建输出
echo 📦 清理Next.js构建输出...
if exist "out" (
    echo   - 删除 out 目录
    rmdir /s /q "out"
    echo   ✅ Next.js构建输出已清理
) else (
    echo   ℹ️ Next.js构建输出不存在，跳过
)

if exist ".next" (
    echo   - 删除 .next 目录
    rmdir /s /q ".next"
    echo   ✅ Next.js缓存已清理
) else (
    echo   ℹ️ Next.js缓存不存在，跳过
)

:: 清理Node.js缓存
echo 📦 清理Node.js缓存...
if exist "node_modules\.cache" (
    echo   - 删除 node_modules\.cache 目录
    rmdir /s /q "node_modules\.cache"
    echo   ✅ Node.js缓存已清理
) else (
    echo   ℹ️ Node.js缓存不存在，跳过
)

:: 清理临时文件
echo 📦 清理临时文件...
for /r %%i in (*.tmp, *.temp, *.log) do (
    if exist "%%i" (
        echo   - 删除 %%i
        del /q "%%i" 2>nul
    )
)

:: 清理系统临时文件
if exist ".DS_Store" (
    echo   - 删除 .DS_Store 文件
    del /q ".DS_Store" 2>nul
)

echo.
echo ✅ 构建清理完成！
echo.
echo 📊 清理统计：
echo   - Rust构建缓存: 已清理
echo   - Next.js输出: 已清理  
echo   - Node.js缓存: 已清理
echo   - 临时文件: 已清理
echo.
echo 💡 提示：
echo   - 下次构建将重新编译所有依赖
echo   - 首次构建可能需要更长时间
echo   - 建议在发布前执行完整清理
echo.

:: 询问是否重新安装依赖
set /p reinstall=是否重新安装Node.js依赖？(y/N): 
if /i "%reinstall%"=="y" (
    echo.
    echo 📦 重新安装Node.js依赖...
    pnpm install
    if %errorlevel% equ 0 (
        echo ✅ 依赖安装完成
    ) else (
        echo ❌ 依赖安装失败
    )
)

echo.
pause
