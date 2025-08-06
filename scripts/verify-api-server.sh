#!/bin/bash

# API服务器配置验证脚本
# 用于验证版本发布后API服务器是否正确配置

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 配置变量
API_BASE_URL="https://www.yujinkeji.asia/api/releases"
HEALTH_URL="https://www.yujinkeji.asia/health"

# 函数：打印带颜色的消息
print_status() {
    local status=$1
    local message=$2
    case $status in
        "SUCCESS")
            echo -e "${GREEN}✅ $message${NC}"
            ;;
        "ERROR")
            echo -e "${RED}❌ $message${NC}"
            ;;
        "WARNING")
            echo -e "${YELLOW}⚠️  $message${NC}"
            ;;
        "INFO")
            echo -e "${BLUE}ℹ️  $message${NC}"
            ;;
    esac
}

# 函数：检查服务器健康状态
check_server_health() {
    print_status "INFO" "检查API服务器健康状态..."
    
    local response=$(curl -s "$HEALTH_URL" 2>/dev/null)
    if [ $? -eq 0 ] && echo "$response" | grep -q '"status":"ok"'; then
        print_status "SUCCESS" "API服务器运行正常"
        return 0
    else
        print_status "ERROR" "API服务器健康检查失败"
        return 1
    fi
}

# 函数：验证版本更新检测
verify_version_update() {
    local old_version=$1
    local expected_new_version=$2
    
    print_status "INFO" "验证版本 $old_version 能否检测到 $expected_new_version 更新..."
    
    local response=$(curl -s "$API_BASE_URL/windows-x86_64/$old_version" 2>/dev/null)
    if [ $? -ne 0 ]; then
        print_status "ERROR" "API请求失败"
        return 1
    fi
    
    # 检查返回的版本号
    local returned_version=$(echo "$response" | grep -o '"version":"[^"]*"' | cut -d'"' -f4)
    if [ "$returned_version" != "$expected_new_version" ]; then
        print_status "ERROR" "版本检测失败: 期望 $expected_new_version，实际返回 $returned_version"
        echo "完整响应: $response"
        return 1
    fi
    
    # 检查是否包含更新信息
    if echo "$response" | grep -q '"platforms":{}'; then
        print_status "ERROR" "版本检测失败: 返回空的platforms，表示无更新"
        echo "完整响应: $response"
        return 1
    elif echo "$response" | grep -q '"windows-x86_64"'; then
        print_status "SUCCESS" "版本检测正常: $old_version → $expected_new_version"
        return 0
    else
        print_status "ERROR" "版本检测失败: platforms格式异常"
        echo "完整响应: $response"
        return 1
    fi
}

# 函数：验证最新版本无更新状态
verify_latest_version() {
    local latest_version=$1
    
    print_status "INFO" "验证最新版本 $latest_version 返回无更新状态..."
    
    local response=$(curl -s "$API_BASE_URL/windows-x86_64/$latest_version" 2>/dev/null)
    if [ $? -ne 0 ]; then
        print_status "ERROR" "API请求失败"
        return 1
    fi
    
    # 检查是否返回无更新状态
    if echo "$response" | grep -q '"platforms":{}'; then
        print_status "SUCCESS" "最新版本状态正确: 返回无更新"
        return 0
    else
        print_status "ERROR" "最新版本状态异常: 应该返回无更新"
        echo "完整响应: $response"
        return 1
    fi
}

# 主函数
main() {
    echo "=================================================="
    echo "        API服务器配置验证脚本"
    echo "=================================================="
    echo ""
    
    # 检查参数
    if [ $# -lt 2 ]; then
        echo "用法: $0 <旧版本号> <新版本号> [其他旧版本...]"
        echo "示例: $0 1.0.21 1.0.22"
        echo "示例: $0 1.0.21 1.0.22 1.0.20 1.0.19"
        exit 1
    fi
    
    local old_version=$1
    local new_version=$2
    shift 2
    local other_old_versions=("$@")
    
    local all_passed=true
    
    # 1. 检查服务器健康状态
    if ! check_server_health; then
        all_passed=false
    fi
    echo ""
    
    # 2. 验证主要旧版本的更新检测
    if ! verify_version_update "$old_version" "$new_version"; then
        all_passed=false
    fi
    echo ""
    
    # 3. 验证其他旧版本的更新检测
    for version in "${other_old_versions[@]}"; do
        if ! verify_version_update "$version" "$new_version"; then
            all_passed=false
        fi
        echo ""
    done
    
    # 4. 验证最新版本的无更新状态
    if ! verify_latest_version "$new_version"; then
        all_passed=false
    fi
    echo ""
    
    # 输出总结
    echo "=================================================="
    if [ "$all_passed" = true ]; then
        print_status "SUCCESS" "所有验证通过！API服务器配置正确"
        echo ""
        print_status "INFO" "用户现在可以正常检测到版本更新"
        exit 0
    else
        print_status "ERROR" "验证失败！需要重新配置API服务器"
        echo ""
        print_status "INFO" "请执行以下命令重新配置:"
        echo "curl -X POST \"$API_BASE_URL\" \\"
        echo "  -H \"Authorization: Bearer chengshang-admin-token-2025-secure-update-server-key\" \\"
        echo "  -H \"Content-Type: application/json\" \\"
        echo "  -d '{\"target\": \"windows-x86_64\", \"version\": \"$new_version\", ...}'"
        exit 1
    fi
}

# 执行主函数
main "$@"
