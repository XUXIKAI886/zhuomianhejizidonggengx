// 简单的密码哈希生成脚本
// 如果没有bcrypt，使用简单的哈希算法

const crypto = require('crypto');

function simpleHash(password, salt = 'chengshang2025') {
  return crypto.createHash('sha256').update(password + salt).digest('hex');
}

// 生成管理员密码哈希
const adminPassword = 'admin@2025csch';
const testPassword = 'test123456';

const adminHash = simpleHash(adminPassword);
const testHash = simpleHash(testPassword);

console.log('='.repeat(60));
console.log('🔐 MongoDB管理员账号信息');
console.log('='.repeat(60));
console.log('管理员账号:');
console.log('  用户名: admin');
console.log('  密码: admin@2025csch');
console.log('  哈希: ' + adminHash);
console.log('');
console.log('测试用户:');
console.log('  用户名: testuser');
console.log('  密码: test123456');
console.log('  哈希: ' + testHash);
console.log('='.repeat(60));

// 生成MongoDB插入语句
console.log('\n📝 MongoDB插入语句:');
console.log('='.repeat(60));
console.log(`// 连接到数据库
use chengshang_tools;

// 创建管理员账号
db.users.insertOne({
  username: "admin",
  password: "${adminHash}",
  role: "admin",
  isActive: true,
  createdAt: new Date(),
  lastLoginAt: null,
  totalUsageTime: 0,
  loginCount: 0
});

// 创建测试用户
db.users.insertOne({
  username: "testuser", 
  password: "${testHash}",
  role: "user",
  isActive: true,
  createdAt: new Date(),
  lastLoginAt: null,
  totalUsageTime: 0,
  loginCount: 0
});

// 创建索引
db.users.createIndex({ "username": 1 }, { unique: true });
db.users.createIndex({ "role": 1 });
db.users.createIndex({ "isActive": 1 });

// 验证创建结果
print("用户创建完成！");
db.users.find({}, {password: 0}).forEach(printjson);`);

console.log('='.repeat(60));
console.log('💡 使用说明:');
console.log('1. 复制上面的MongoDB语句');
console.log('2. 在MongoDB Shell中执行');
console.log('3. 或者运行: node scripts/hash-password.js > create-users.js');
console.log('4. 然后: mongosh "连接字符串" --file create-users.js');
console.log('='.repeat(60));
