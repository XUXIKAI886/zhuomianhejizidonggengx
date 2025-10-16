# Tauri智能构建脚本 - PowerShell版本
Write-Host "🚀 开始Tauri智能构建流程..." -ForegroundColor Green
Write-Host ""

# 步骤1: 备份API路由
Write-Host "📁 步骤1: 备份API路由..." -ForegroundColor Yellow
if (Test-Path "app\api") {
    if (Test-Path "api_backup") {
        Remove-Item -Recurse -Force "api_backup"
    }
    New-Item -ItemType Directory -Path "api_backup" -Force | Out-Null
    Copy-Item -Recurse "app\api" "api_backup\api"
    Remove-Item -Recurse -Force "app\api"
    Write-Host "✅ API路由已备份到 api_backup\api" -ForegroundColor Green
} else {
    Write-Host "⏭️  API路由不存在，跳过备份" -ForegroundColor Gray
}

# 步骤2: 清理缓存和进程
Write-Host ""
Write-Host "🧹 步骤2: 清理缓存和进程..." -ForegroundColor Yellow
try {
    # 终止所有Node.js进程
    Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
    Write-Host "✅ Node.js进程已清理" -ForegroundColor Green
} catch {
    Write-Host "⚠️  清理Node.js进程时出现警告" -ForegroundColor Yellow
}

# 清理缓存目录
@(".next", "out", "node_modules\.cache") | ForEach-Object {
    if (Test-Path $_) {
        Remove-Item -Recurse -Force $_ -ErrorAction SilentlyContinue
        Write-Host "✅ 已清理 $_" -ForegroundColor Green
    }
}

# 步骤3: 执行Next.js构建
Write-Host ""
Write-Host "🔨 步骤3: 执行Next.js构建..." -ForegroundColor Yellow
try {
    # 设置环境变量以增加内存限制
    $env:NODE_OPTIONS = "--max-old-space-size=4096"
    
    # 执行构建
    $buildProcess = Start-Process -FilePath "npm" -ArgumentList "run", "build" -Wait -PassThru -NoNewWindow
    
    if ($buildProcess.ExitCode -eq 0) {
        Write-Host "✅ Next.js构建成功" -ForegroundColor Green
        
        # 步骤4: 执行Tauri构建
        Write-Host ""
        Write-Host "⚡ 步骤4: 执行Tauri构建..." -ForegroundColor Yellow
        
        $tauriProcess = Start-Process -FilePath "tauri" -ArgumentList "build" -Wait -PassThru -NoNewWindow
        
        if ($tauriProcess.ExitCode -eq 0) {
            Write-Host "✅ Tauri构建成功" -ForegroundColor Green
        } else {
            Write-Host "❌ Tauri构建失败" -ForegroundColor Red
        }
    } else {
        Write-Host "❌ Next.js构建失败" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ 构建过程中出现错误: $($_.Exception.Message)" -ForegroundColor Red
}

# 步骤5: 恢复API路由
Write-Host ""
Write-Host "🔄 步骤5: 恢复API路由..." -ForegroundColor Yellow
if (Test-Path "api_backup\api") {
    Copy-Item -Recurse "api_backup\api" "app\api"
    Remove-Item -Recurse -Force "api_backup"
    Write-Host "✅ API路由已恢复" -ForegroundColor Green
} else {
    Write-Host "⏭️  无需恢复API路由" -ForegroundColor Gray
}

Write-Host ""
Write-Host "🎉 Tauri构建流程完成！" -ForegroundColor Green
Write-Host "📦 安装包位置: src-tauri\target\release\bundle\nsis\" -ForegroundColor Cyan
Write-Host "💡 提示: 开发环境中所有功能都可正常使用" -ForegroundColor Cyan

# 检查构建结果
if (Test-Path "src-tauri\target\release\bundle\nsis") {
    $installers = Get-ChildItem "src-tauri\target\release\bundle\nsis" -Filter "*.exe"
    if ($installers.Count -gt 0) {
        Write-Host ""
        Write-Host "🎯 构建成功！安装包:" -ForegroundColor Green
        $installers | ForEach-Object {
            Write-Host "   📦 $($_.Name)" -ForegroundColor White
        }
    }
}

Write-Host ""
Write-Host "按任意键继续..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
