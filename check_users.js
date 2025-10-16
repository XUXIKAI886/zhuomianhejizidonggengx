// 检查数据库中的用户数据
const { MongoClient } = require('mongodb')
const crypto = require('crypto')

// 密码哈希函数
function hashPassword(password) {
  const salt = 'chengshang2025'
  const hasher = crypto.createHash('sha256')
  hasher.update(password)
  hasher.update(salt)
  return hasher.digest('hex')
}

async function checkUsers() {
  const client = new MongoClient('mongodb://root:6scldk9f@dbconn.sealosbja.site:39056/chengshang_tools?authSource=admin')
  
  try {
    await client.connect()
    console.log('✅ 连接到MongoDB成功')
    
    const db = client.db('chengshang_tools')
    const users = db.collection('users')
    
    // 查询所有用户
    const allUsers = await users.find({}).toArray()
    console.log(`\n📊 数据库中共有 ${allUsers.length} 个用户：`)
    
    allUsers.forEach((user, index) => {
      console.log(`\n用户 ${index + 1}:`)
      console.log(`  ID: ${user._id}`)
      console.log(`  用户名: ${user.username}`)
      console.log(`  密码哈希: ${user.password}`)
      console.log(`  角色: ${user.role}`)
      console.log(`  状态: ${user.isActive ? '激活' : '禁用'}`)
      console.log(`  创建时间: ${user.createdAt}`)
      console.log(`  登录次数: ${user.loginCount || 0}`)
    })
    
    // 测试新创建用户的密码
    const testUsers = [
      { username: '王郡江', password: 'ytK1j0zWkf$L' },
      { username: '张玉莲', password: 'FYxEhJPz38*y' },
      { username: '杨有淇', password: 'Ks8I3Y*vU7fX' }
    ]
    
    console.log('\n🔍 测试密码验证：')
    for (const testUser of testUsers) {
      const dbUser = allUsers.find(u => u.username === testUser.username)
      if (dbUser) {
        const expectedHash = hashPassword(testUser.password)
        const isMatch = dbUser.password === expectedHash
        console.log(`\n${testUser.username}:`)
        console.log(`  期望哈希: ${expectedHash}`)
        console.log(`  数据库哈希: ${dbUser.password}`)
        console.log(`  密码匹配: ${isMatch ? '✅ 是' : '❌ 否'}`)
      } else {
        console.log(`\n${testUser.username}: ❌ 用户不存在`)
      }
    }
    
  } catch (error) {
    console.error('❌ 数据库操作失败:', error)
  } finally {
    await client.close()
  }
}

checkUsers()
