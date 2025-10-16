# 🚨 Tauri构建问题立即解决方案

## 🎯 问题现状
您遇到的错误：
```
Error: export const dynamic = "force-static"/export const revalidate not configured on route "/api/debug/check-data" with "output: export"
```

**根本原因**: Next.js静态导出模式与API路由不兼容

## 💡 立即解决方案

### 方案1: PowerShell脚本（推荐）
```powershell
# 在PowerShell中执行
.\build-tauri.ps1
```

### 方案2: 手动执行（如果脚本失败）
```powershell
# 1. 备份API路由
New-Item -ItemType Directory -Path "api_backup" -Force
Copy-Item -Recurse "app\api" "api_backup\api"
Remove-Item -Recurse -Force "app\api"

# 2. 清理环境
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force
Remove-Item -Recurse -Force ".next" -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force "out" -ErrorAction SilentlyContinue

# 3. 设置内存限制并构建
$env:NODE_OPTIONS = "--max-old-space-size=4096"
npm run build

# 4. 如果Next.js构建成功，执行Tauri构建
tauri build

# 5. 恢复API路由
Copy-Item -Recurse "api_backup\api" "app\api"
Remove-Item -Recurse -Force "api_backup"
```

### 方案3: 最简单的临时解决方案
如果上述方案都有问题，您可以：

1. **临时删除API路由**:
   ```powershell
   Remove-Item -Recurse -Force "app\api"
   ```

2. **执行构建**:
   ```powershell
   npm run tauri:build
   ```

3. **从Git恢复API路由**:
   ```powershell
   git checkout -- app/api
   ```

## 🔧 构建卡顿解决方案

如果构建过程卡住：

### 1. 增加内存限制
```powershell
$env:NODE_OPTIONS = "--max-old-space-size=4096"
```

### 2. 清理所有缓存
```powershell
Remove-Item -Recurse -Force ".next", "out", "node_modules\.cache" -ErrorAction SilentlyContinue
```

### 3. 重启系统
如果问题持续，建议重启计算机后再次尝试。

## 📦 构建成功标志

构建成功后，您会看到：
- **安装包位置**: `src-tauri\target\release\bundle\nsis\csch_1.0.25_x64-setup.exe`
- **构建时间**: 约3-5分钟
- **文件大小**: 约20-35MB

## 🎯 快速验证

构建完成后，检查以下文件是否存在：
```powershell
Test-Path "src-tauri\target\release\app.exe"
Test-Path "src-tauri\target\release\bundle\nsis\*.exe"
```

## 🔄 开发环境恢复

构建完成后，确保开发环境正常：
```powershell
# 启动开发服务器测试
npm run dev
```

## 📞 紧急联系

如果所有方案都失败：
1. 重启计算机
2. 检查磁盘空间（至少需要5GB）
3. 检查内存使用情况
4. 暂时关闭杀毒软件

---
**立即行动**: 请选择上述任一方案执行，推荐使用PowerShell脚本方案。
