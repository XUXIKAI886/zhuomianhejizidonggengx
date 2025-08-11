$headers = @{
    "Authorization" = "Bearer chengshang-admin-token-2025-secure-update-server-key"
    "Content-Type" = "application/json; charset=utf-8"
}

$body = @{
    target = "windows-x86_64"
    version = "1.0.25"
    notes = "Tool Link Optimization Update`n`nMain Features:`n• Updated keyword description file upload/download center link`n• Optimized tool access experience`n• Improved system stability`n• Enhanced user interface responsiveness"
    signature = "dW50cnVzdGVkIGNvbW1lbnQ6IHJzdCBzaWduaW5nIGNyeXB0b2dyYXBoaWNhbGx5IHNlY3VyZSBzaWduYXR1cmVzIGFyZSBhdmFpbGFibGUgZm9yIGluc3RhbGxpbmdcblJXU0JBSG9yOEJlSkcxZ3pPdmJTZ2VoZTE2amQ2"
    url = "https://github.com/XUXIKAI886/zhuomianhejizidonggengx/releases/download/v1.0.25/csch_1.0.25_x64-setup.exe"
    platforms = @{
        "windows-x86_64" = @{
            signature = "dW50cnVzdGVkIGNvbW1lbnQ6IHJzdCBzaWduaW5nIGNyeXB0b2dyYXBoaWNhbGx5IHNlY3VyZSBzaWduYXR1cmVzIGFyZSBhdmFpbGFibGUgZm9yIGluc3RhbGxpbmdcblJXU0JBSG9yOEJlSkcxZ3pPdmJTZ2VoZTE2amQ2"
            url = "https://github.com/XUXIKAI886/zhuomianhejizidonggengx/releases/download/v1.0.25/csch_1.0.25_x64-setup.exe"
        }
    }
} | ConvertTo-Json -Depth 3

try {
    $response = Invoke-RestMethod -Uri "https://www.yujinkeji.asia/api/releases" -Method POST -Headers $headers -Body $body
    Write-Host "Update server configuration successful" -ForegroundColor Green
    Write-Host "Response: $response" -ForegroundColor Yellow
} catch {
    Write-Host "Update server configuration failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Details: $($_.Exception)" -ForegroundColor Red
}
