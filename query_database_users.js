// 直接查询数据库中的用户信息
const { MongoClient } = require('mongodb')
const crypto = require('crypto')

// 密码哈希函数（与系统一致）
function hashPassword(password) {
  const salt = 'chengshang2025'
  const hasher = crypto.createHash('sha256')
  hasher.update(password)
  hasher.update(salt)
  return hasher.digest('hex')
}

async function queryUsers() {
  // 使用正确的MongoDB连接字符串
  const uri = 'mongodb://root:6scldk9f@dbconn.sealosbja.site:39056/chengshang_tools?authSource=admin'
  const client = new MongoClient(uri)
  
  try {
    console.log('🔗 正在连接到MongoDB...')
    await client.connect()
    console.log('✅ 连接成功！')
    
    const db = client.db('chengshang_tools')
    const usersCollection = db.collection('users')
    
    // 查询所有用户
    console.log('\n📊 查询数据库中的所有用户...')
    const users = await usersCollection.find({}).toArray()
    
    console.log(`\n🎯 数据库中共有 ${users.length} 个用户：`)
    console.log('=' .repeat(80))
    
    users.forEach((user, index) => {
      console.log(`\n👤 用户 ${index + 1}:`)
      console.log(`   ID: ${user._id}`)
      console.log(`   用户名: ${user.username}`)
      console.log(`   密码哈希: ${user.password}`)
      console.log(`   角色: ${user.role}`)
      console.log(`   状态: ${user.isActive ? '✅ 激活' : '❌ 禁用'}`)
      console.log(`   创建时间: ${user.createdAt}`)
      console.log(`   最后登录: ${user.lastLoginAt || '从未登录'}`)
      console.log(`   登录次数: ${user.loginCount || 0}`)
    })
    
    // 测试新创建用户的密码哈希
    console.log('\n🔍 测试密码验证：')
    console.log('=' .repeat(80))
    
    const testUsers = [
      { username: '王郡江', password: 'ytK1j0zWkf$L' },
      { username: '张玉莲', password: 'FYxEhJPz38*y' },
      { username: '杨有淇', password: 'Ks8I3Y*vU7fX' }
    ]
    
    for (const testUser of testUsers) {
      const dbUser = users.find(u => u.username === testUser.username)
      if (dbUser) {
        const expectedHash = hashPassword(testUser.password)
        const isMatch = dbUser.password === expectedHash
        
        console.log(`\n🔐 ${testUser.username}:`)
        console.log(`   数据库哈希: ${dbUser.password}`)
        console.log(`   期望哈希:   ${expectedHash}`)
        console.log(`   密码匹配:   ${isMatch ? '✅ 正确' : '❌ 错误'}`)
        console.log(`   用户状态:   ${dbUser.isActive ? '✅ 激活' : '❌ 禁用'}`)
        
        if (!isMatch) {
          console.log(`   🔧 建议: 需要重置 ${testUser.username} 的密码`)
        }
      } else {
        console.log(`\n❌ ${testUser.username}: 用户不存在于数据库中`)
      }
    }
    
    // 查找管理员用户
    console.log('\n👑 管理员用户：')
    console.log('=' .repeat(80))
    const adminUsers = users.filter(u => u.role === 'admin')
    if (adminUsers.length > 0) {
      adminUsers.forEach(admin => {
        console.log(`   👑 ${admin.username} (${admin.isActive ? '激活' : '禁用'})`)
      })
    } else {
      console.log('   ⚠️ 没有找到管理员用户！')
    }
    
    // 统计信息
    console.log('\n📈 统计信息：')
    console.log('=' .repeat(80))
    console.log(`   总用户数: ${users.length}`)
    console.log(`   激活用户: ${users.filter(u => u.isActive).length}`)
    console.log(`   禁用用户: ${users.filter(u => !u.isActive).length}`)
    console.log(`   管理员数: ${users.filter(u => u.role === 'admin').length}`)
    console.log(`   普通用户: ${users.filter(u => u.role === 'user').length}`)
    console.log(`   有登录记录: ${users.filter(u => u.loginCount > 0).length}`)
    
  } catch (error) {
    console.error('❌ 数据库操作失败:', error.message)
    if (error.code) {
      console.error(`   错误代码: ${error.code}`)
    }
  } finally {
    await client.close()
    console.log('\n🔚 数据库连接已关闭')
  }
}

// 执行查询
console.log('🚀 开始查询数据库用户信息...')
queryUsers().catch(console.error)
