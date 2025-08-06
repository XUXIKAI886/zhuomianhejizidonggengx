# API服务器配置验证脚本 (PowerShell版本)
# 用于验证版本发布后API服务器是否正确配置

param(
    [Parameter(Mandatory=$true)]
    [string]$OldVersion,
    
    [Parameter(Mandatory=$true)]
    [string]$NewVersion,
    
    [Parameter(Mandatory=$false)]
    [string[]]$OtherOldVersions = @()
)

# 配置变量
$ApiBaseUrl = "https://www.yujinkeji.asia/api/releases"
$HealthUrl = "https://www.yujinkeji.asia/health"

# 函数：打印带颜色的消息
function Write-Status {
    param(
        [string]$Status,
        [string]$Message
    )
    
    switch ($Status) {
        "SUCCESS" { 
            Write-Host "✅ $Message" -ForegroundColor Green 
        }
        "ERROR" { 
            Write-Host "❌ $Message" -ForegroundColor Red 
        }
        "WARNING" { 
            Write-Host "⚠️  $Message" -ForegroundColor Yellow 
        }
        "INFO" { 
            Write-Host "ℹ️  $Message" -ForegroundColor Blue 
        }
    }
}

# 函数：检查服务器健康状态
function Test-ServerHealth {
    Write-Status "INFO" "检查API服务器健康状态..."
    
    try {
        $response = Invoke-RestMethod -Uri $HealthUrl -Method GET -TimeoutSec 10
        if ($response.status -eq "ok") {
            Write-Status "SUCCESS" "API服务器运行正常"
            return $true
        } else {
            Write-Status "ERROR" "API服务器健康检查失败"
            return $false
        }
    } catch {
        Write-Status "ERROR" "API服务器健康检查失败: $($_.Exception.Message)"
        return $false
    }
}

# 函数：验证版本更新检测
function Test-VersionUpdate {
    param(
        [string]$OldVer,
        [string]$ExpectedNewVer
    )
    
    Write-Status "INFO" "验证版本 $OldVer 能否检测到 $ExpectedNewVer 更新..."
    
    try {
        $url = "$ApiBaseUrl/windows-x86_64/$OldVer"
        $response = Invoke-RestMethod -Uri $url -Method GET -TimeoutSec 10
        
        # 检查返回的版本号
        if ($response.version -ne $ExpectedNewVer) {
            Write-Status "ERROR" "版本检测失败: 期望 $ExpectedNewVer，实际返回 $($response.version)"
            Write-Host "完整响应: $($response | ConvertTo-Json -Depth 3)" -ForegroundColor Gray
            return $false
        }
        
        # 检查是否包含更新信息
        if (-not $response.platforms -or $response.platforms.Count -eq 0) {
            Write-Status "ERROR" "版本检测失败: 返回空的platforms，表示无更新"
            Write-Host "完整响应: $($response | ConvertTo-Json -Depth 3)" -ForegroundColor Gray
            return $false
        } elseif ($response.platforms.'windows-x86_64') {
            Write-Status "SUCCESS" "版本检测正常: $OldVer → $ExpectedNewVer"
            return $true
        } else {
            Write-Status "ERROR" "版本检测失败: platforms格式异常"
            Write-Host "完整响应: $($response | ConvertTo-Json -Depth 3)" -ForegroundColor Gray
            return $false
        }
    } catch {
        Write-Status "ERROR" "API请求失败: $($_.Exception.Message)"
        return $false
    }
}

# 函数：验证最新版本无更新状态
function Test-LatestVersion {
    param(
        [string]$LatestVer
    )
    
    Write-Status "INFO" "验证最新版本 $LatestVer 返回无更新状态..."
    
    try {
        $url = "$ApiBaseUrl/windows-x86_64/$LatestVer"
        $response = Invoke-RestMethod -Uri $url -Method GET -TimeoutSec 10
        
        # 检查是否返回无更新状态
        if (-not $response.platforms -or $response.platforms.Count -eq 0) {
            Write-Status "SUCCESS" "最新版本状态正确: 返回无更新"
            return $true
        } else {
            Write-Status "ERROR" "最新版本状态异常: 应该返回无更新"
            Write-Host "完整响应: $($response | ConvertTo-Json -Depth 3)" -ForegroundColor Gray
            return $false
        }
    } catch {
        Write-Status "ERROR" "API请求失败: $($_.Exception.Message)"
        return $false
    }
}

# 主函数
function Main {
    Write-Host "==================================================" -ForegroundColor Cyan
    Write-Host "        API服务器配置验证脚本" -ForegroundColor Cyan
    Write-Host "==================================================" -ForegroundColor Cyan
    Write-Host ""
    
    $allPassed = $true
    
    # 1. 检查服务器健康状态
    if (-not (Test-ServerHealth)) {
        $allPassed = $false
    }
    Write-Host ""
    
    # 2. 验证主要旧版本的更新检测
    if (-not (Test-VersionUpdate -OldVer $OldVersion -ExpectedNewVer $NewVersion)) {
        $allPassed = $false
    }
    Write-Host ""
    
    # 3. 验证其他旧版本的更新检测
    foreach ($version in $OtherOldVersions) {
        if (-not (Test-VersionUpdate -OldVer $version -ExpectedNewVer $NewVersion)) {
            $allPassed = $false
        }
        Write-Host ""
    }
    
    # 4. 验证最新版本的无更新状态
    if (-not (Test-LatestVersion -LatestVer $NewVersion)) {
        $allPassed = $false
    }
    Write-Host ""
    
    # 输出总结
    Write-Host "==================================================" -ForegroundColor Cyan
    if ($allPassed) {
        Write-Status "SUCCESS" "所有验证通过！API服务器配置正确"
        Write-Host ""
        Write-Status "INFO" "用户现在可以正常检测到版本更新"
        exit 0
    } else {
        Write-Status "ERROR" "验证失败！需要重新配置API服务器"
        Write-Host ""
        Write-Status "INFO" "请执行以下命令重新配置:"
        Write-Host "curl -X POST `"$ApiBaseUrl`" \" -ForegroundColor Gray
        Write-Host "  -H `"Authorization: Bearer chengshang-admin-token-2025-secure-update-server-key`" \" -ForegroundColor Gray
        Write-Host "  -H `"Content-Type: application/json`" \" -ForegroundColor Gray
        Write-Host "  -d '{`"target`": `"windows-x86_64`", `"version`": `"$NewVersion`", ...}'" -ForegroundColor Gray
        exit 1
    }
}

# 执行主函数
Main
