# Windows 构建环境配置指南

## 🚨 当前问题状态

您遇到的是 Windows 上 Tauri 开发的常见问题：**缺少 Microsoft C++ 构建工具**。

## 📋 解决方案（按优先级排序）

### 方案一：安装 Visual Studio Build Tools 2022（强烈推荐）

1. **下载并安装**：
   - 访问：https://visualstudio.microsoft.com/downloads/
   - 下载 "Visual Studio Build Tools 2022"（免费）
   - 或直接下载：https://aka.ms/vs/17/release/vs_buildtools.exe

2. **选择工作负载**：
   ```
   在 Visual Studio Installer 中选择：
   ✅ C++ 生成工具
   ✅ Windows 10/11 SDK（最新版本）
   ✅ MSVC v143 - VS 2022 C++ x64/x86 生成工具
   ✅ CMake 工具（可选但推荐）
   ```

3. **安装后重启**系统

### 方案二：使用 GNU 工具链（当前尝试方案）

我已经为您配置了 GNU 工具链作为临时解决方案：

```bash
# 已完成的配置
rustup toolchain install stable-x86_64-pc-windows-gnu
rustup default stable-x86_64-pc-windows-gnu
```

**注意**：GNU 工具链在某些情况下可能有兼容性问题，建议最终还是安装 Visual Studio Build Tools。

### 方案三：使用 Chocolatey 快速安装

如果您有 Chocolatey 包管理器：

```bash
# 管理员权限运行
choco install visualstudio2022buildtools -y --package-parameters "--add Microsoft.VisualStudio.Workload.VCTools"
```

## 🔍 验证安装

安装完成后，请验证：

```bash
# 检查 Microsoft C++ 链接器
where link.exe
# 应该显示类似：C:\Program Files (x86)\Microsoft Visual Studio\2022\BuildTools\VC\Tools\MSVC\...\bin\Hostx64\x64\link.exe

# 检查 Rust 工具链
rustc --version
rustup show
```

## 🚀 重新启动应用

安装完成后：

```bash
# 清理缓存
cd src-tauri
cargo clean

# 重新启动开发模式
cd ..
npm run tauri:dev
```

## 🐛 当前状态

应用正在尝试使用 GNU 工具链编译，这个过程需要一些时间。如果编译成功，应用将启动；如果失败，请按照方案一安装 Visual Studio Build Tools。

## 📝 开发环境要求总结

为了获得最佳的 Tauri 开发体验，您需要：

1. **Node.js** ✅（已安装）
2. **Rust** ✅（已安装）
3. **Microsoft C++ 构建工具** ❌（需要安装）
4. **WebView2** ✅（Windows 10/11 自带）

## 💡 替代方案

如果您只是想预览应用效果，可以：

1. **仅运行前端**：
   ```bash
   npm run dev
   # 访问 http://localhost:3000
   ```

2. **构建静态版本**：
   ```bash
   npm run build
   # 查看 out/ 目录中的静态文件
   ```

这样您可以先查看和调试前端界面，然后再解决桌面应用的构建问题。