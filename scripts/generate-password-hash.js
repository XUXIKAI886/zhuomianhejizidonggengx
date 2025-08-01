// 生成bcrypt密码哈希的Node.js脚本
// 运行方法：node scripts/generate-password-hash.js

const bcrypt = require('bcrypt');

async function generatePasswordHash() {
  const password = 'admin@2025csch';
  const saltRounds = 12;
  
  try {
    const hash = await bcrypt.hash(password, saltRounds);
    console.log('='.repeat(60));
    console.log('🔐 MongoDB管理员账号密码哈希生成');
    console.log('='.repeat(60));
    console.log('原始密码:', password);
    console.log('bcrypt哈希:', hash);
    console.log('='.repeat(60));
    
    // 验证哈希是否正确
    const isValid = await bcrypt.compare(password, hash);
    console.log('哈希验证:', isValid ? '✅ 成功' : '❌ 失败');
    
    // 生成MongoDB插入语句
    console.log('\n📝 MongoDB插入语句:');
    console.log('='.repeat(60));
    console.log(`db.users.insertOne({
  username: "admin",
  password: "${hash}",
  role: "admin",
  isActive: true,
  createdAt: new Date(),
  lastLoginAt: null,
  totalUsageTime: 0,
  loginCount: 0
});`);
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('生成密码哈希失败:', error);
  }
}

// 检查是否安装了bcrypt
try {
  require('bcrypt');
  generatePasswordHash();
} catch (error) {
  console.log('❌ 请先安装bcrypt依赖:');
  console.log('npm install bcrypt');
  console.log('然后重新运行此脚本');
}
