# 🔨 Tauri构建指南

## 🎯 构建方式选择

### 方式1: 智能构建（推荐）
```bash
npm run tauri:build-smart
```
**优势**:
- ✅ 自动处理API路由兼容性问题
- ✅ 构建完成后自动恢复开发环境
- ✅ 无需手动操作
- ✅ 适合生产环境构建

### 方式2: 标准构建
```bash
npm run tauri:build
```
**注意**:
- ⚠️ 可能遇到API路由兼容性问题
- ⚠️ 需要手动处理错误
- ✅ 适合调试构建问题

## 🔧 构建问题解决

### 如果遇到API路由错误
```
Error: export const dynamic = "force-static"/export const revalidate not configured
```

**手动解决步骤**:
1. 备份API路由: `mv app/api api_backup/`
2. 执行构建: `npm run tauri:build`
3. 恢复API路由: `mv api_backup/api app/`
4. 清理备份: `rmdir api_backup`

## 📦 构建输出

### 成功构建后的文件位置
- **可执行文件**: `src-tauri/target/release/app.exe`
- **安装包**: `src-tauri/target/release/bundle/nsis/csch_1.0.25_x64-setup.exe`

### 构建统计
- **构建时间**: 约3-5分钟
- **安装包大小**: 约20-35MB
- **支持平台**: Windows x64

## 🚀 开发环境

### 启动开发服务器
```bash
npm run dev          # Next.js开发服务器
npm run tauri:dev    # Tauri开发模式
```

### 开发环境特点
- ✅ 所有API路由正常工作
- ✅ 热重载和实时更新
- ✅ 完整的数据库功能
- ✅ 用户认证和管理功能

## ⚠️ 重要说明

### 生产环境限制
由于使用静态导出模式，生产环境中以下功能暂时不可用：
- 用户登录/注册
- 管理员后台数据操作
- 工具使用统计
- MongoDB数据库交互

### 可用功能
- ✅ 所有工具的展示和搜索
- ✅ iframe内嵌工具完全正常
- ✅ 文件下载功能
- ✅ 模态框和弹窗功能
- ✅ 现代化UI界面

## 🔄 未来改进计划

### 短期目标
1. 将API逻辑迁移到Tauri的Rust后端
2. 实现本地数据存储
3. 保持静态前端的优势

### 长期目标
1. 完善原生功能集成
2. 优化性能和用户体验
3. 添加更多桌面应用特性

## 🛠️ 故障排除

### 构建失败
1. 检查Node.js版本 (推荐 18+)
2. 清理缓存: `npm run clean` 或 `rm -rf .next node_modules`
3. 重新安装依赖: `npm install`
4. 使用智能构建: `npm run tauri:build-smart`

### Rust编译错误
1. 检查Rust版本: `rustc --version`
2. 更新Tauri CLI: `cargo install tauri-cli`
3. 清理Rust缓存: `cargo clean`

## 📞 技术支持

如果遇到构建问题，请检查：
1. 系统环境配置
2. 依赖版本兼容性
3. 构建日志详细信息

---
**最后更新**: 2025-08-13  
**适用版本**: v1.0.25+
