# Update Server Configuration Script - v1.0.21
# Simple version without complex error handling

$headers = @{
    "Authorization" = "Bearer chengshang-admin-token-2025-secure-update-server-key"
    "Content-Type" = "application/json; charset=utf-8"
}

$bodyData = @{
    target = "windows-x86_64"
    version = "1.0.21"
    notes = "Weather API Final Fix Version\n\nMain Features:\n• Complete HTTP Permission Configuration\n• Independent HTTP Capability File\n• Correct URL Scope Settings\n• Fixed JSON Syntax Errors\n• Full Development and Production Compatibility\n• Weather Component Fully Functional"
    signature = "dW50cnVzdGVkIGNvbW1lbnQ6IHJzdCBzaWduaW5nIGNyeXB0b2dyYXBoaWNhbGx5IHNlY3VyZSBzaWduYXR1cmVzIGFyZSBhdmFpbGFibGUgZm9yIGluc3RhbGxpbmdcblJXU0JBSG9yOEJlSkcxZ3pPdmJTZ2VoZTE2amQ2"
    url = "https://github.com/XUXIKAI886/zhuomianhejizidonggengx/releases/download/v1.0.21/csch_1.0.21_x64-setup.exe"
}

$body = $bodyData | ConvertTo-Json -Depth 10

Write-Host "Configuring update server v1.0.21..." -ForegroundColor Green
Write-Host "Target: windows-x86_64" -ForegroundColor Yellow
Write-Host "Version: 1.0.21" -ForegroundColor Yellow
Write-Host "URL: https://github.com/XUXIKAI886/zhuomianhejizidonggengx/releases/download/v1.0.21/csch_1.0.21_x64-setup.exe" -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod -Uri "https://www.yujinkeji.asia/api/releases" -Method POST -Headers $headers -Body $body
    Write-Host "Success: Update server configured!" -ForegroundColor Green
    Write-Host "Response: $response" -ForegroundColor Cyan
} catch {
    if ($_.Exception.Response.StatusCode -eq 409) {
        Write-Host "Success: Version already exists!" -ForegroundColor Green
    } else {
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "Status Code: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Next step: Execute step 5 - Create version status marker" -ForegroundColor Magenta
