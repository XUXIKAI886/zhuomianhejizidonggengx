// 验证密码哈希问题
const crypto = require('crypto')

// 新的哈希函数（修复后，与Rust一致）
function hashPasswordNew(password) {
  const salt = 'chengshang2025'
  const hasher = crypto.createHash('sha256')
  hasher.update(password)  // 先密码
  hasher.update(salt)      // 后盐值
  return hasher.digest('hex')
}

// 旧的哈希函数（有问题的版本）
function hashPasswordOld(password) {
  const salt = 'chengshang2025'
  return crypto.createHash('sha256').update(password + salt).digest('hex')
}

// 测试三个用户的密码
const users = [
  { username: '王郡江', password: 'ytK1j0zWkf$L' },
  { username: '张玉莲', password: 'FYxEhJPz38*y' },
  { username: '杨有淇', password: 'Ks8I3Y*vU7fX' }
]

console.log('🔍 密码哈希验证：')
console.log('=' .repeat(80))

users.forEach(user => {
  const newHash = hashPasswordNew(user.password)
  const oldHash = hashPasswordOld(user.password)
  
  console.log(`\n👤 ${user.username}:`)
  console.log(`   密码: ${user.password}`)
  console.log(`   新哈希: ${newHash}`)
  console.log(`   旧哈希: ${oldHash}`)
  console.log(`   是否相同: ${newHash === oldHash ? '是' : '否'}`)
})

console.log('\n🎯 结论：')
console.log('如果新旧哈希不同，说明用户是用旧算法创建的，需要重置密码！')
console.log('\n💡 解决方案：')
console.log('1. 在管理后台重置这三个用户的密码')
console.log('2. 或者删除用户重新创建')
