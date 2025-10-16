# 强制构建剪贴板修复版本 - v1.0.26
Write-Host "🚀 强制构建剪贴板修复版本 v1.0.26..." -ForegroundColor Green
Write-Host ""

# 步骤1: 彻底清理环境
Write-Host "🧹 步骤1: 彻底清理环境..." -ForegroundColor Yellow
try {
    # 终止所有相关进程
    Get-Process -Name "node", "npm", "next", "tauri" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
    Write-Host "✅ 进程已清理" -ForegroundColor Green
} catch {
    Write-Host "⚠️  进程清理完成" -ForegroundColor Yellow
}

# 彻底清理所有缓存和构建文件
$cleanupPaths = @(
    ".next",
    "out", 
    "node_modules\.cache",
    "src-tauri\target\release",
    ".turbo",
    ".swc"
)

foreach ($path in $cleanupPaths) {
    if (Test-Path $path) {
        try {
            Remove-Item -Recurse -Force $path -ErrorAction SilentlyContinue
            Write-Host "✅ 已清理 $path" -ForegroundColor Green
        } catch {
            Write-Host "⚠️  清理 $path 时出现警告" -ForegroundColor Yellow
        }
    }
}

# 步骤2: 备份API路由
Write-Host ""
Write-Host "📁 步骤2: 备份API路由..." -ForegroundColor Yellow
if (Test-Path "app\api") {
    if (Test-Path "api_backup_final") {
        Remove-Item -Recurse -Force "api_backup_final"
    }
    New-Item -ItemType Directory -Path "api_backup_final" -Force | Out-Null
    Copy-Item -Recurse "app\api" "api_backup_final\api"
    Remove-Item -Recurse -Force "app\api"
    Write-Host "✅ API路由已备份并移除" -ForegroundColor Green
} else {
    Write-Host "⏭️  API路由不存在，跳过备份" -ForegroundColor Gray
}

# 步骤3: 设置优化环境变量
Write-Host ""
Write-Host "⚙️ 步骤3: 设置构建环境..." -ForegroundColor Yellow
$env:NODE_OPTIONS = "--max-old-space-size=8192 --no-warnings"
$env:NEXT_TELEMETRY_DISABLED = "1"
$env:CI = "true"
$env:FORCE_COLOR = "0"
Write-Host "✅ 环境变量已设置" -ForegroundColor Green

# 步骤4: 分步构建
Write-Host ""
Write-Host "🔨 步骤4: 执行Next.js构建..." -ForegroundColor Yellow

# 首先尝试快速构建
try {
    Write-Host "📦 尝试快速构建..." -ForegroundColor Cyan
    $buildProcess = Start-Process -FilePath "npm" -ArgumentList "run", "build" -Wait -PassThru -NoNewWindow -RedirectStandardOutput "build_output.log" -RedirectStandardError "build_error.log"
    
    if ($buildProcess.ExitCode -eq 0) {
        Write-Host "✅ Next.js构建成功" -ForegroundColor Green
        
        # 步骤5: 执行Tauri构建
        Write-Host ""
        Write-Host "⚡ 步骤5: 执行Tauri构建..." -ForegroundColor Yellow
        
        try {
            $tauriProcess = Start-Process -FilePath "tauri" -ArgumentList "build" -Wait -PassThru -NoNewWindow -RedirectStandardOutput "tauri_output.log" -RedirectStandardError "tauri_error.log"
            
            if ($tauriProcess.ExitCode -eq 0) {
                Write-Host "✅ Tauri构建成功" -ForegroundColor Green
                $buildSuccess = $true
            } else {
                Write-Host "❌ Tauri构建失败，查看 tauri_error.log" -ForegroundColor Red
                $buildSuccess = $false
            }
        } catch {
            Write-Host "❌ Tauri构建过程中出现错误: $($_.Exception.Message)" -ForegroundColor Red
            $buildSuccess = $false
        }
    } else {
        Write-Host "❌ Next.js构建失败，查看 build_error.log" -ForegroundColor Red
        $buildSuccess = $false
    }
} catch {
    Write-Host "❌ 构建过程中出现错误: $($_.Exception.Message)" -ForegroundColor Red
    $buildSuccess = $false
}

# 步骤6: 恢复API路由
Write-Host ""
Write-Host "🔄 步骤6: 恢复API路由..." -ForegroundColor Yellow
if (Test-Path "api_backup_final\api") {
    Copy-Item -Recurse "api_backup_final\api" "app\api"
    Remove-Item -Recurse -Force "api_backup_final"
    Write-Host "✅ API路由已恢复" -ForegroundColor Green
} else {
    Write-Host "⏭️  无需恢复API路由" -ForegroundColor Gray
}

# 步骤7: 检查构建结果
Write-Host ""
Write-Host "🎯 步骤7: 检查构建结果..." -ForegroundColor Yellow

if (Test-Path "src-tauri\target\release\app.exe") {
    $exeInfo = Get-Item "src-tauri\target\release\app.exe"
    Write-Host "✅ 可执行文件已生成:" -ForegroundColor Green
    Write-Host "   📁 路径: $($exeInfo.FullName)" -ForegroundColor White
    Write-Host "   📏 大小: $([math]::Round($exeInfo.Length / 1MB, 2)) MB" -ForegroundColor White
    Write-Host "   🕒 时间: $($exeInfo.LastWriteTime)" -ForegroundColor White
}

if (Test-Path "src-tauri\target\release\bundle\nsis") {
    $newInstallers = Get-ChildItem "src-tauri\target\release\bundle\nsis" -Filter "*1.0.26*"
    if ($newInstallers.Count -gt 0) {
        Write-Host ""
        Write-Host "🎉 剪贴板修复版本安装包已生成:" -ForegroundColor Green
        $newInstallers | ForEach-Object {
            Write-Host "   📦 $($_.Name)" -ForegroundColor White
            Write-Host "   📏 大小: $([math]::Round($_.Length / 1MB, 2)) MB" -ForegroundColor White
            Write-Host "   🕒 时间: $($_.LastWriteTime)" -ForegroundColor White
        }
        
        Write-Host ""
        Write-Host "🔧 剪贴板修复功能:" -ForegroundColor Cyan
        Write-Host "   ✅ iframe剪贴板读取权限" -ForegroundColor Green
        Write-Host "   ✅ iframe剪贴板写入权限" -ForegroundColor Green
        Write-Host "   ✅ 域锦科技AI系统复制按钮修复" -ForegroundColor Green
        Write-Host "   ✅ 所有iframe工具剪贴板功能增强" -ForegroundColor Green
        
    } else {
        Write-Host "⚠️  未找到v1.0.26安装包" -ForegroundColor Yellow
        $allInstallers = Get-ChildItem "src-tauri\target\release\bundle\nsis" -Filter "*.exe"
        if ($allInstallers.Count -gt 0) {
            Write-Host "📦 现有安装包:" -ForegroundColor Gray
            $allInstallers | Select-Object -Last 3 | ForEach-Object {
                Write-Host "   📦 $($_.Name)" -ForegroundColor Gray
            }
        }
    }
}

# 清理日志文件
if (Test-Path "build_output.log") { Remove-Item "build_output.log" -ErrorAction SilentlyContinue }
if (Test-Path "build_error.log") { Remove-Item "build_error.log" -ErrorAction SilentlyContinue }
if (Test-Path "tauri_output.log") { Remove-Item "tauri_output.log" -ErrorAction SilentlyContinue }
if (Test-Path "tauri_error.log") { Remove-Item "tauri_error.log" -ErrorAction SilentlyContinue }

Write-Host ""
if ($buildSuccess) {
    Write-Host "🎉 剪贴板修复版本构建完成！" -ForegroundColor Green
    Write-Host "💡 现在可以测试域锦科技AI系统的复制功能了" -ForegroundColor Cyan
} else {
    Write-Host "⚠️  构建过程中遇到问题，但环境已恢复" -ForegroundColor Yellow
    Write-Host "💡 建议重启计算机后重新尝试" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "按任意键继续..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
