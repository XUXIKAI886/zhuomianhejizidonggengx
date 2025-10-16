// 测试密码哈希函数是否与Rust后端一致
const crypto = require('crypto')

// TypeScript前端的哈希函数（修复后）
function hashPasswordFixed(password) {
  const salt = 'chengshang2025'
  const hasher = crypto.createHash('sha256')
  hasher.update(password)  // 先更新密码
  hasher.update(salt)      // 再更新盐值，与Rust后端保持一致
  return hasher.digest('hex')
}

// 旧的哈希函数（有问题的版本）
function hashPasswordOld(password) {
  const salt = 'chengshang2025'
  return crypto.createHash('sha256').update(password + salt).digest('hex')
}

// 测试密码
const testPasswords = [
  'ytK1j0zWkf$L',  // 王郡江的密码
  'FYxEhJPz38*y',  // 张玉莲的密码
  'Ks8I3Y*vU7fX'   // 杨有淇的密码
]

console.log('🔍 密码哈希测试结果：')
console.log('==========================================')

testPasswords.forEach((password, index) => {
  const usernames = ['王郡江', '张玉莲', '杨有淇']
  const fixedHash = hashPasswordFixed(password)
  const oldHash = hashPasswordOld(password)
  
  console.log(`\n用户: ${usernames[index]}`)
  console.log(`密码: ${password}`)
  console.log(`修复后哈希: ${fixedHash}`)
  console.log(`旧版本哈希: ${oldHash}`)
  console.log(`哈希是否相同: ${fixedHash === oldHash ? '是' : '否'}`)
})

console.log('\n==========================================')
console.log('🚨 如果哈希不相同，说明修复成功！')
console.log('💡 需要重新创建用户或更新数据库中的密码哈希')
