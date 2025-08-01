# NSIS安装包构建完整指南

## 📋 概述

本文档详细介绍如何构建呈尚策划工具箱的NSIS安装包，包括环境配置、构建流程、故障排除和分发策略。

## 🎯 为什么选择NSIS

### NSIS vs MSI vs 直接EXE对比

| 特性 | 直接EXE | MSI | NSIS |
|------|---------|-----|------|
| **用户体验** | ⚠️ 简单 | ✅ 专业 | ✅ **最佳** |
| **依赖检测** | ❌ 无 | ⚠️ 基础 | ✅ **智能** |
| **安装定制** | ❌ 无 | ⚠️ 有限 | ✅ **完全可定制** |
| **错误处理** | ❌ 系统级 | ⚠️ 基础 | ✅ **用户友好** |
| **分发便利** | ⚠️ 需说明 | ✅ 标准 | ✅ **最佳** |
| **企业部署** | ❌ 困难 | ✅ 支持 | ✅ **完全支持** |

### NSIS的核心优势

1. **智能依赖管理**
   - 自动检测WebView2运行时
   - 提供清晰的安装指导
   - 支持自动下载依赖

2. **专业安装体验**
   - 现代化安装界面
   - 进度显示和状态反馈
   - 多语言支持

3. **企业级部署**
   - 静默安装支持
   - 批量部署脚本
   - 组策略兼容

## 🔧 环境准备

### 开发环境要求

```bash
# 检查Node.js版本
node --version  # 需要 >= 18.0.0

# 检查Rust版本
rustc --version  # 需要 >= 1.70.0

# 检查Tauri CLI
cargo tauri --version  # 需要 >= 2.0.0
```

### 系统要求

- **操作系统**: Windows 10/11 (推荐在目标平台构建)
- **内存**: >= 4GB RAM
- **磁盘空间**: >= 5GB 可用空间
- **网络**: 稳定的互联网连接 (下载依赖)

## 📦 构建配置

### 1. Tauri配置文件

项目已配置为默认使用NSIS，配置位于 `src-tauri/tauri.conf.json`：

```json
{
  "bundle": {
    "active": true,
    "targets": ["nsis"],
    "publisher": "呈尚策划",
    "category": "Productivity",
    "shortDescription": "呈尚策划专业工具集合",
    "longDescription": "集成19个专业工具的桌面应用，服务于运营、美工、销售、人事、客服等不同岗位的工作需求"
  }
}
```

### 2. 高级NSIS配置

如需自定义安装行为，可添加NSIS特定配置：

```json
{
  "bundle": {
    "nsis": {
      "displayLanguageSelector": false,
      "installerIcon": "icons/icon.ico",
      "installMode": "perMachine",
      "allowToChangeInstallationDirectory": true,
      "deleteAppDataOnUninstall": false,
      "shortcutName": "呈尚策划工具箱",
      "publisherName": "呈尚策划",
      "installScript": "custom-install.nsh"
    }
  }
}
```

## 🚀 构建流程

### 标准构建流程

```bash
# 1. 清理之前的构建
cargo clean
rm -rf src-tauri/target/release/bundle

# 2. 安装/更新依赖
pnpm install

# 3. 执行完整构建
npm run tauri:build

# 4. 验证构建结果
ls -la src-tauri/target/release/bundle/nsis/
```

### 构建过程详解

#### 阶段1: 前端构建
```bash
# Next.js静态站点生成
npm run build
# 输出: out/ 目录包含所有静态文件
```

#### 阶段2: Rust编译
```bash
# Rust代码编译为可执行文件
cargo build --release
# 输出: src-tauri/target/release/app.exe
```

#### 阶段3: NSIS打包
```bash
# 使用NSIS创建安装程序
# 自动包含: app.exe + 静态文件 + 图标 + 配置
# 输出: 呈尚策划项目展示_1.0.0_x64-setup.exe
```

### 构建优化

#### 并行构建
```bash
# 设置并行编译任务数
set CARGO_BUILD_JOBS=4
npm run tauri:build
```

#### 增量构建
```bash
# 开发时使用增量构建
npm run tauri:dev
# 仅在发布时使用完整构建
npm run tauri:build
```

## 📊 构建产物分析

### 文件结构
```
src-tauri/target/release/
├── app.exe                                    # 主程序 (15-25MB)
├── bundle/
│   └── nsis/
│       └── 呈尚策划项目展示_1.0.0_x64-setup.exe  # NSIS安装包 (20-35MB)
├── resources/                                 # 应用资源
│   └── icon.ico
└── deps/                                      # 依赖库文件
```

### 大小分析
- **app.exe**: 15-25MB (包含Rust运行时 + WebView2绑定)
- **NSIS安装包**: 20-35MB (包含app.exe + 静态文件 + 安装逻辑)
- **压缩率**: 约15-20% (NSIS内置压缩)

## 🔍 质量检查

### 自动化检查脚本

创建 `scripts/verify-build.bat`：

```batch
@echo off
echo ================================
echo NSIS安装包质量检查
echo ================================

set NSIS_FILE=src-tauri\target\release\bundle\nsis\呈尚策划项目展示_1.0.0_x64-setup.exe

if not exist "%NSIS_FILE%" (
    echo ❌ 错误: NSIS安装包不存在
    exit /b 1
)

echo ✅ 安装包文件存在
for %%A in ("%NSIS_FILE%") do echo 文件大小: %%~zA 字节

echo.
echo 🔍 执行基础检查...

# 检查文件签名 (如果有)
signtool verify /pa "%NSIS_FILE%" 2>nul
if %errorlevel% equ 0 (
    echo ✅ 数字签名验证通过
) else (
    echo ⚠️ 未检测到数字签名
)

echo.
echo 📋 建议手动测试:
echo 1. 在虚拟机中测试安装
echo 2. 验证快捷方式创建
echo 3. 测试应用启动
echo 4. 验证卸载功能

pause
```

### 手动检查清单

#### ✅ 文件完整性
- [ ] NSIS安装包已生成
- [ ] 文件大小在合理范围 (20-35MB)
- [ ] 文件名包含正确版本号
- [ ] 图标显示正确

#### ✅ 安装测试
- [ ] 安装程序可以启动
- [ ] 安装过程无错误
- [ ] 进度显示正常
- [ ] 安装路径可选择

#### ✅ 功能测试
- [ ] 应用可以正常启动
- [ ] 所有19个工具可访问
- [ ] WebView功能正常
- [ ] 快捷方式工作正常

#### ✅ 卸载测试
- [ ] 卸载程序存在
- [ ] 卸载过程完整
- [ ] 文件清理干净
- [ ] 注册表清理正确

## 🐛 故障排除

### 常见构建问题

#### 问题1: "failed to bundle project"
```bash
# 解决方案:
# 1. 清理构建缓存
cargo clean
rm -rf src-tauri/target

# 2. 更新工具链
rustup update
cargo install tauri-cli --locked

# 3. 重新构建
npm run tauri:build
```

#### 问题2: "NSIS compiler not found"
```bash
# Windows系统会自动下载NSIS
# 如果失败，手动安装:
# 1. 下载 NSIS 3.08+ from https://nsis.sourceforge.io/
# 2. 安装到默认路径
# 3. 重新运行构建
```

#### 问题3: 构建成功但安装包无法运行
```bash
# 检查步骤:
# 1. 验证目标系统架构 (需要64位)
# 2. 检查WebView2依赖
# 3. 以管理员身份运行
# 4. 检查防病毒软件误报
```

### 性能问题

#### 构建速度慢
```bash
# 优化方案:
# 1. 使用SSD存储
# 2. 增加内存
# 3. 启用并行编译
set CARGO_BUILD_JOBS=8

# 4. 使用本地缓存
set CARGO_TARGET_DIR=D:\cache\target
```

#### 安装包过大
```bash
# 分析和优化:
# 1. 检查静态文件大小
du -sh out/

# 2. 优化图片资源
# 3. 移除未使用的依赖
# 4. 启用更高压缩级别 (在NSIS配置中)
```

## 📋 分发策略

### 分发文件准备

```
分发包/
├── 呈尚策划项目展示_1.0.0_x64-setup.exe    # 主安装包
├── 安装说明.txt                           # 用户指南
├── 系统要求.txt                           # 兼容性说明
└── 故障排除.txt                           # 常见问题解决
```

### 用户指南模板

创建 `安装说明.txt`：

```
呈尚策划工具箱 - 安装指南

系统要求:
- Windows 10/11 (64位)
- 4GB+ 内存
- 500MB+ 磁盘空间
- 网络连接

安装步骤:
1. 双击 "呈尚策划项目展示_1.0.0_x64-setup.exe"
2. 按照安装向导提示操作
3. 选择安装路径 (可选)
4. 等待安装完成
5. 启动应用

如果遇到问题:
1. 确保系统为Windows 10/11 64位
2. 安装WebView2运行时: https://developer.microsoft.com/microsoft-edge/webview2/
3. 以管理员身份运行安装包
4. 联系技术支持

技术支持: support@chengshangcehua.com
```

### 企业部署

#### 静默安装
```batch
# 静默安装命令
"呈尚策划项目展示_1.0.0_x64-setup.exe" /S

# 指定安装路径
"呈尚策划项目展示_1.0.0_x64-setup.exe" /S /D=C:\Program Files\ChengShangCeHua
```

#### 批量部署脚本
```batch
@echo off
echo 呈尚策划工具箱 - 批量部署脚本

# 检查管理员权限
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo 错误: 需要管理员权限
    pause
    exit /b 1
)

# 执行静默安装
echo 正在安装呈尚策划工具箱...
"呈尚策划项目展示_1.0.0_x64-setup.exe" /S

if %errorlevel% equ 0 (
    echo ✅ 安装成功完成
) else (
    echo ❌ 安装失败，错误代码: %errorlevel%
)

pause
```

## 📈 版本管理

### 版本号更新

更新版本时需要修改以下文件：

1. **package.json**
```json
{
  "version": "1.1.0"
}
```

2. **src-tauri/tauri.conf.json**
```json
{
  "version": "1.1.0"
}
```

3. **src-tauri/Cargo.toml**
```toml
[package]
version = "1.1.0"
```

### 自动化版本更新脚本

创建 `scripts/update-version.js`：

```javascript
const fs = require('fs');
const path = require('path');

const newVersion = process.argv[2];
if (!newVersion) {
    console.error('请提供新版本号: node update-version.js 1.1.0');
    process.exit(1);
}

// 更新 package.json
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
packageJson.version = newVersion;
fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));

// 更新 tauri.conf.json
const tauriConf = JSON.parse(fs.readFileSync('src-tauri/tauri.conf.json', 'utf8'));
tauriConf.version = newVersion;
fs.writeFileSync('src-tauri/tauri.conf.json', JSON.stringify(tauriConf, null, 2));

// 更新 Cargo.toml
let cargoToml = fs.readFileSync('src-tauri/Cargo.toml', 'utf8');
cargoToml = cargoToml.replace(/version = "[\d\.]+"/, `version = "${newVersion}"`);
fs.writeFileSync('src-tauri/Cargo.toml', cargoToml);

console.log(`✅ 版本已更新为 ${newVersion}`);
```

## 🎯 最佳实践

### 构建前检查
1. 确保所有代码已提交
2. 运行完整测试套件
3. 更新版本号
4. 更新CHANGELOG

### 构建过程
1. 使用干净的环境
2. 记录构建日志
3. 验证构建产物
4. 执行质量检查

### 发布后
1. 在多个环境测试
2. 收集用户反馈
3. 监控安装成功率
4. 准备热修复方案

---

## 📞 技术支持

如果在NSIS构建过程中遇到问题，请：

1. 查看构建日志
2. 检查环境配置
3. 参考故障排除部分
4. 联系开发团队

**联系方式**: support@chengshangcehua.com
