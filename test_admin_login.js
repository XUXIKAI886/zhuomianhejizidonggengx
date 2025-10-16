/**
 * 测试管理员登录 - 验证admin账号密码
 */

const { MongoClient } = require('mongodb');
const crypto = require('crypto');

// MongoDB连接配置
const MONGO_URI = 'mongodb://root:6scldk9f@dbconn.sealosbja.site:39056/';
const DB_NAME = 'chengshang_tools';

// 密码哈希函数（与Rust backend一致）
function hashPassword(password) {
  const salt = 'chengshang2025'; // 必须与Rust backend保持一致
  return crypto
    .createHash('sha256')
    .update(password + salt)
    .digest('hex');
}

async function testAdminLogin() {
  const client = new MongoClient(MONGO_URI);

  try {
    await client.connect();
    console.log('✅ MongoDB连接成功');

    const db = client.db(DB_NAME);
    const usersCollection = db.collection('users');

    // 查找admin用户
    const admin = await usersCollection.findOne({ username: 'admin' });

    if (!admin) {
      console.error('❌ 数据库中未找到admin用户');
      return;
    }

    console.log('\n📋 Admin用户信息:');
    console.log('  用户名:', admin.username);
    console.log('  角色:', admin.role);
    console.log('  状态:', admin.isActive ? '启用' : '禁用');
    console.log('  创建时间:', admin.createdAt);
    console.log('  数据库密码哈希:', admin.password);

    // 测试不同的密码
    const testPasswords = [
      'admin@2025csch',
      'admin',
      'admin123',
      '123456',
      'chengshang2025'
    ];

    console.log('\n🔐 测试密码匹配:');
    for (const password of testPasswords) {
      const hashedPassword = hashPassword(password);
      const isMatch = hashedPassword === admin.password;
      console.log(`  ${isMatch ? '✅' : '❌'} 密码: "${password}" => ${hashedPassword.substring(0, 16)}...`);

      if (isMatch) {
        console.log(`\n🎉 找到正确密码: ${password}`);
      }
    }

  } catch (error) {
    console.error('❌ 错误:', error.message);
  } finally {
    await client.close();
  }
}

testAdminLogin();
