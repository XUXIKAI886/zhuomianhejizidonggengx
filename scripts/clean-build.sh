#!/bin/bash

echo "================================"
echo "呈尚策划工具箱 - 构建清理脚本"
echo "================================"
echo

echo "🧹 开始清理构建文件和缓存..."
echo

# 清理Rust构建缓存
echo "📦 清理Rust构建缓存..."
if [ -d "src-tauri/target" ]; then
    echo "  - 删除 src-tauri/target 目录"
    rm -rf src-tauri/target
    echo "  ✅ Rust构建缓存已清理"
else
    echo "  ℹ️ Rust构建缓存不存在，跳过"
fi

# 清理Next.js构建输出
echo "📦 清理Next.js构建输出..."
if [ -d "out" ]; then
    echo "  - 删除 out 目录"
    rm -rf out
    echo "  ✅ Next.js构建输出已清理"
else
    echo "  ℹ️ Next.js构建输出不存在，跳过"
fi

if [ -d ".next" ]; then
    echo "  - 删除 .next 目录"
    rm -rf .next
    echo "  ✅ Next.js缓存已清理"
else
    echo "  ℹ️ Next.js缓存不存在，跳过"
fi

# 清理Node.js缓存
echo "📦 清理Node.js缓存..."
if [ -d "node_modules/.cache" ]; then
    echo "  - 删除 node_modules/.cache 目录"
    rm -rf node_modules/.cache
    echo "  ✅ Node.js缓存已清理"
else
    echo "  ℹ️ Node.js缓存不存在，跳过"
fi

# 清理临时文件
echo "📦 清理临时文件..."
find . -name "*.tmp" -o -name "*.temp" -o -name "*.log" -o -name ".DS_Store" 2>/dev/null | while read file; do
    if [ -f "$file" ]; then
        echo "  - 删除 $file"
        rm -f "$file"
    fi
done

echo
echo "✅ 构建清理完成！"
echo
echo "📊 清理统计："
echo "  - Rust构建缓存: 已清理"
echo "  - Next.js输出: 已清理"
echo "  - Node.js缓存: 已清理"
echo "  - 临时文件: 已清理"
echo
echo "💡 提示："
echo "  - 下次构建将重新编译所有依赖"
echo "  - 首次构建可能需要更长时间"
echo "  - 建议在发布前执行完整清理"
echo

# 询问是否重新安装依赖
read -p "是否重新安装Node.js依赖？(y/N): " reinstall
if [[ $reinstall =~ ^[Yy]$ ]]; then
    echo
    echo "📦 重新安装Node.js依赖..."
    if command -v pnpm &> /dev/null; then
        pnpm install
    elif command -v npm &> /dev/null; then
        npm install
    else
        echo "❌ 未找到npm或pnpm，请手动安装依赖"
        exit 1
    fi
    
    if [ $? -eq 0 ]; then
        echo "✅ 依赖安装完成"
    else
        echo "❌ 依赖安装失败"
    fi
fi

echo
