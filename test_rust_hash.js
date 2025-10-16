// 测试不同的哈希方式
const crypto = require('crypto')

// 方式1：TypeScript前端方式（字符串拼接）
function hashMethod1(password) {
  const salt = 'chengshang2025'
  return crypto.createHash('sha256').update(password + salt).digest('hex')
}

// 方式2：Rust后端方式（分别update）
function hashMethod2(password) {
  const salt = 'chengshang2025'
  const hasher = crypto.createHash('sha256')
  hasher.update(password)
  hasher.update(salt)
  return hasher.digest('hex')
}

// 方式3：测试不同的顺序
function hashMethod3(password) {
  const salt = 'chengshang2025'
  const hasher = crypto.createHash('sha256')
  hasher.update(salt)      // 先盐值
  hasher.update(password)  // 后密码
  return hasher.digest('hex')
}

// 测试密码
const testPassword = 'ytK1j0zWkf$L'

console.log('🔍 不同哈希方式测试：')
console.log('==========================================')
console.log(`测试密码: ${testPassword}`)
console.log(`方式1 (字符串拼接): ${hashMethod1(testPassword)}`)
console.log(`方式2 (分别update): ${hashMethod2(testPassword)}`)
console.log(`方式3 (盐值在前):   ${hashMethod3(testPassword)}`)

console.log('\n比较结果:')
console.log(`方式1 == 方式2: ${hashMethod1(testPassword) === hashMethod2(testPassword)}`)
console.log(`方式1 == 方式3: ${hashMethod1(testPassword) === hashMethod3(testPassword)}`)
console.log(`方式2 == 方式3: ${hashMethod2(testPassword) === hashMethod3(testPassword)}`)

// 测试实际的Rust代码逻辑
console.log('\n🦀 模拟Rust代码逻辑:')
function rustLikeHash(password) {
  const salt = 'chengshang2025'
  const hasher = crypto.createHash('sha256')
  hasher.update(Buffer.from(password, 'utf8'))  // password.as_bytes()
  hasher.update(Buffer.from(salt, 'utf8'))      // salt.as_bytes()
  return hasher.digest('hex')
}

console.log(`Rust模拟哈希: ${rustLikeHash(testPassword)}`)
console.log(`与方式2相同: ${rustLikeHash(testPassword) === hashMethod2(testPassword)}`)
