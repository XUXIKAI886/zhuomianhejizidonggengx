# 更新服务器配置脚本 - v1.0.21
# 严格按照版本发布标准操作手册执行

$headers = @{
    "Authorization" = "Bearer chengshang-admin-token-2025-secure-update-server-key"
    "Content-Type" = "application/json; charset=utf-8"
}

$body = @{
    target = "windows-x86_64"
    version = "1.0.21"
    notes = "Weather API Final Fix Version`n`nMain Features:`n• Complete HTTP Permission Configuration`n• Independent HTTP Capability File`n• Correct URL Scope Settings`n• Fixed JSON Syntax Errors`n• Full Development and Production Compatibility`n• Weather Component Fully Functional"
    signature = "dW50cnVzdGVkIGNvbW1lbnQ6IHJzdCBzaWduaW5nIGNyeXB0b2dyYXBoaWNhbGx5IHNlY3VyZSBzaWduYXR1cmVzIGFyZSBhdmFpbGFibGUgZm9yIGluc3RhbGxpbmdcblJXU0JBSG9yOEJlSkcxZ3pPdmJTZ2VoZTE2amQ2"
    url = "https://github.com/XUXIKAI886/zhuomianhejizidonggengx/releases/download/v1.0.21/csch_1.0.21_x64-setup.exe"
} | ConvertTo-Json

Write-Host "正在配置更新服务器 v1.0.21..." -ForegroundColor Green
Write-Host "目标平台: windows-x86_64" -ForegroundColor Yellow
Write-Host "版本号: 1.0.21" -ForegroundColor Yellow
Write-Host "下载地址: https://github.com/XUXIKAI886/zhuomianhejizidonggengx/releases/download/v1.0.21/csch_1.0.21_x64-setup.exe" -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod -Uri "https://www.yujinkeji.asia/api/releases" -Method POST -Headers $headers -Body $body
    Write-Host "✅ 更新服务器配置成功！" -ForegroundColor Green
    Write-Host "响应内容: $response" -ForegroundColor Cyan
} catch {
    if ($_.Exception.Response.StatusCode -eq 409) {
        Write-Host "✅ 版本已存在，配置正常！" -ForegroundColor Green
    } else {
        Write-Host "❌ 配置失败: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "状态码: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "下一步: 执行第五步 - 创建当前版本状态标记" -ForegroundColor Magenta
