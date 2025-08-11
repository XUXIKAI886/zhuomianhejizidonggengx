// 测试更新检测API
async function testUpdateDetection() {
    console.log('🔍 开始测试更新检测API...')
    
    try {
        // 测试v1.0.24版本检查更新
        console.log('📡 请求: https://www.yujinkeji.asia/api/releases/windows-x86_64/1.0.24')
        
        const response = await fetch('https://www.yujinkeji.asia/api/releases/windows-x86_64/1.0.24')
        const data = await response.json()
        
        console.log('✅ API响应成功:')
        console.log('版本:', data.version)
        console.log('发布日期:', data.pub_date)
        console.log('更新说明:', data.notes)
        console.log('平台信息:', data.platforms)
        
        // 检查是否有更新
        if (data.platforms && Object.keys(data.platforms).length > 0) {
            console.log('🎉 发现更新版本:', data.version)
            console.log('下载链接:', data.platforms['windows-x86_64']?.url)
            console.log('数字签名:', data.platforms['windows-x86_64']?.signature)
        } else {
            console.log('ℹ️ 当前已是最新版本')
        }
        
    } catch (error) {
        console.error('❌ API请求失败:', error)
    }
}

// 在浏览器控制台中运行
testUpdateDetection()
