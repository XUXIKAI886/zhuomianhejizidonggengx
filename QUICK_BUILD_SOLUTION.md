# 🚀 Tauri构建快速解决方案

## 🎯 问题说明
由于Next.js静态导出模式与API路由不兼容，导致构建失败：
```
Error: export const dynamic = "force-static"/export const revalidate not configured on route "/api/debug/check-data" with "output: export"
```

## 💡 解决方案

### 方案1: 使用批处理脚本（推荐）
```bash
# 双击运行或在命令行执行
build-tauri.bat
```

**优势**:
- ✅ 自动备份和恢复API路由
- ✅ 清理缓存避免构建卡顿
- ✅ Windows原生支持，无需额外依赖
- ✅ 出错时自动恢复环境

### 方案2: 手动执行步骤
```bash
# 1. 备份API路由
mkdir api_backup
xcopy app\api api_backup\api\ /e /i /q
rmdir /s /q app\api

# 2. 清理缓存
rmdir /s /q .next
rmdir /s /q out

# 3. 执行构建
npm run build
tauri build

# 4. 恢复API路由
xcopy api_backup\api app\api\ /e /i /q
rmdir /s /q api_backup
```

### 方案3: 修改配置（高级用户）
如果您熟悉Tauri配置，可以考虑：
1. 将API逻辑迁移到Tauri的Rust后端
2. 使用Tauri的IPC机制替代HTTP API
3. 保持前端静态，后端原生的架构

## 🔧 故障排除

### 如果构建卡住
1. **终止所有Node.js进程**:
   ```bash
   taskkill /f /im node.exe
   ```

2. **清理所有缓存**:
   ```bash
   rmdir /s /q .next
   rmdir /s /q out
   rmdir /s /q node_modules\.cache
   ```

3. **重新安装依赖**:
   ```bash
   npm install
   ```

### 如果内存不足
1. 关闭其他应用程序
2. 增加虚拟内存
3. 考虑分步构建

### 如果权限问题
1. 以管理员身份运行命令行
2. 检查文件夹权限
3. 关闭杀毒软件的实时保护

## 📦 构建成功后

### 安装包位置
- **可执行文件**: `src-tauri\target\release\app.exe`
- **安装包**: `src-tauri\target\release\bundle\nsis\csch_1.0.25_x64-setup.exe`

### 功能状态
- ✅ 所有工具的展示和搜索功能
- ✅ iframe内嵌工具完全正常
- ✅ 文件下载和模态框功能
- ✅ 现代化UI界面
- ❌ 需要后端API的功能（登录、管理等）

## 🔄 开发环境恢复

构建完成后，API路由会自动恢复，开发环境功能完整：
```bash
npm run dev          # 启动开发服务器
npm run tauri:dev    # 启动Tauri开发模式
```

## 📞 技术支持

如果遇到问题：
1. 检查系统资源（内存、磁盘空间）
2. 确保Node.js和Rust环境正常
3. 查看构建日志的详细错误信息
4. 尝试重启计算机后再次构建

---
**最后更新**: 2025-08-13  
**适用版本**: v1.0.25+  
**测试环境**: Windows 10/11
