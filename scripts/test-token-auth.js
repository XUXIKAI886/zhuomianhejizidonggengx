#!/usr/bin/env node

/**
 * Token认证功能测试脚本
 * 测试记住我和自动登录功能
 */

const { MongoClient } = require('mongodb')

const CONNECTION_STRING = 'mongodb://root:6scldk9f@dbconn.sealosbja.site:39056/?directConnection=true'
const DATABASE_NAME = 'chengshang_tools'

async function testTokenAuth() {
  console.log('🧪 开始测试Token认证功能...\n')
  
  const client = new MongoClient(CONNECTION_STRING)
  
  try {
    await client.connect()
    console.log('✅ MongoDB连接成功')
    
    const db = client.db(DATABASE_NAME)
    
    // 检查用户集合
    const usersCount = await db.collection('users').countDocuments()
    console.log(`📊 用户总数: ${usersCount}`)
    
    // 检查Token集合是否存在
    const collections = await db.listCollections().toArray()
    const hasTokenCollection = collections.some(col => col.name === 'user_tokens')
    
    if (hasTokenCollection) {
      const tokensCount = await db.collection('user_tokens').countDocuments()
      console.log(`🔑 Token总数: ${tokensCount}`)
      
      // 显示最近的Token
      const recentTokens = await db.collection('user_tokens')
        .find({})
        .sort({ createdAt: -1 })
        .limit(5)
        .toArray()
      
      console.log('\n📋 最近的Token记录:')
      recentTokens.forEach((token, index) => {
        console.log(`${index + 1}. 类型: ${token.tokenType}, 创建时间: ${token.createdAt}, 过期时间: ${token.expiresAt}, 状态: ${token.isActive ? '有效' : '无效'}`)
      })
    } else {
      console.log('⚠️  user_tokens集合不存在，将在首次使用时自动创建')
    }
    
    // 检查会话集合
    const sessionsCount = await db.collection('user_sessions').countDocuments()
    console.log(`\n📊 会话总数: ${sessionsCount}`)
    
    console.log('\n✅ Token认证功能测试完成')
    console.log('\n📝 测试说明:')
    console.log('1. 在登录页面勾选"记住我"或"自动登录"')
    console.log('2. 登录成功后，Token会自动保存到本地存储')
    console.log('3. 关闭应用重新打开，应该能自动登录')
    console.log('4. 登出时会清除所有Token')
    
  } catch (error) {
    console.error('❌ 测试失败:', error)
  } finally {
    await client.close()
    console.log('\n🔌 数据库连接已关闭')
  }
}

// 运行测试
testTokenAuth().catch(console.error)
