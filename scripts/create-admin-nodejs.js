// Node.js版本的MongoDB管理员账号创建脚本
// 运行方法：node scripts/create-admin-nodejs.js

const { MongoClient } = require('mongodb');
const crypto = require('crypto');

// MongoDB连接配置
const CONNECTION_STRING = 'mongodb://root:6scldk9f@dbconn.sealosbja.site:39056/?directConnection=true';
const DATABASE_NAME = 'chengshang_tools';

// 密码哈希函数
function hashPassword(password) {
  const salt = 'chengshang2025';
  return crypto.createHash('sha256').update(password + salt).digest('hex');
}

async function createAdminAccount() {
  let client;
  
  try {
    console.log('🚀 开始创建呈尚策划工具箱管理员账号...');
    console.log('='.repeat(60));
    
    // 连接到MongoDB
    console.log('📡 连接到MongoDB数据库...');
    client = new MongoClient(CONNECTION_STRING);
    await client.connect();
    
    const db = client.db(DATABASE_NAME);
    const usersCollection = db.collection('users');
    
    console.log('✅ 数据库连接成功！');
    
    // 删除已存在的账号（如果有）
    console.log('🧹 清理已存在的账号...');
    await usersCollection.deleteMany({username: {$in: ["admin", "testuser"]}});
    console.log('✅ 清理完成');
    
    // 创建管理员账号
    console.log('👤 创建管理员账号...');
    const adminPassword = 'admin@2025csch';
    const adminHash = hashPassword(adminPassword);
    
    const adminResult = await usersCollection.insertOne({
      username: "admin",
      password: adminHash,
      role: "admin",
      isActive: true,
      createdAt: new Date(),
      lastLoginAt: null,
      totalUsageTime: 0,
      loginCount: 0
    });
    
    if (adminResult.acknowledged) {
      console.log('✅ 管理员账号创建成功！');
      console.log('   用户名: admin');
      console.log('   密码: admin@2025csch');
      console.log('   角色: 管理员');
      console.log('   账号ID: ' + adminResult.insertedId);
      console.log('   密码哈希: ' + adminHash);
    } else {
      console.log('❌ 管理员账号创建失败！');
      return;
    }
    
    // 创建测试用户
    console.log('\n👤 创建测试用户...');
    const testPassword = 'test123456';
    const testHash = hashPassword(testPassword);
    
    const testUserResult = await usersCollection.insertOne({
      username: "testuser",
      password: testHash,
      role: "user",
      isActive: true,
      createdAt: new Date(),
      lastLoginAt: null,
      totalUsageTime: 0,
      loginCount: 0
    });
    
    if (testUserResult.acknowledged) {
      console.log('✅ 测试用户创建成功！');
      console.log('   用户名: testuser');
      console.log('   密码: test123456');
      console.log('   角色: 普通用户');
      console.log('   密码哈希: ' + testHash);
    } else {
      console.log('❌ 测试用户创建失败！');
    }
    
    // 创建数据库索引
    console.log('\n📝 创建数据库索引...');
    
    try {
      await usersCollection.createIndex({ "username": 1 }, { unique: true });
      await usersCollection.createIndex({ "role": 1 });
      await usersCollection.createIndex({ "isActive": 1 });
      await usersCollection.createIndex({ "lastLoginAt": -1 });
      console.log('✅ users集合索引创建完成');
    } catch (error) {
      console.log('⚠️  索引可能已存在:', error.message);
    }
    
    // 为其他集合创建索引
    const toolUsageCollection = db.collection('tool_usage');
    const userSessionsCollection = db.collection('user_sessions');
    
    try {
      await toolUsageCollection.createIndex({ "userId": 1, "toolId": 1 }, { unique: true });
      await toolUsageCollection.createIndex({ "toolId": 1 });
      await toolUsageCollection.createIndex({ "lastUsedAt": -1 });
      console.log('✅ tool_usage集合索引创建完成');
    } catch (error) {
      console.log('⚠️  tool_usage索引可能已存在');
    }
    
    try {
      await userSessionsCollection.createIndex({ "userId": 1 });
      await userSessionsCollection.createIndex({ "loginAt": -1 });
      await userSessionsCollection.createIndex({ "logoutAt": -1 });
      console.log('✅ user_sessions集合索引创建完成');
    } catch (error) {
      console.log('⚠️  user_sessions索引可能已存在');
    }
    
    // 验证创建结果
    console.log('\n📊 验证数据库状态...');
    const userCount = await usersCollection.countDocuments();
    const adminCount = await usersCollection.countDocuments({role: "admin"});
    const activeUserCount = await usersCollection.countDocuments({isActive: true});
    
    console.log('总用户数: ' + userCount);
    console.log('管理员数: ' + adminCount);
    console.log('活跃用户数: ' + activeUserCount);
    
    // 显示所有用户
    console.log('\n👥 当前用户列表:');
    console.log('-'.repeat(60));
    
    const users = await usersCollection.find({}, {projection: {password: 0}}).toArray();
    users.forEach(user => {
      console.log('用户名: ' + user.username + 
                  ' | 角色: ' + user.role + 
                  ' | 状态: ' + (user.isActive ? '启用' : '禁用') +
                  ' | 创建时间: ' + user.createdAt.toISOString().split('T')[0]);
    });
    
    console.log('\n🎉 管理员账号创建完成！');
    console.log('='.repeat(60));
    console.log('🔐 登录信息:');
    console.log('   管理员 - 用户名: admin, 密码: admin@2025csch');
    console.log('   测试用户 - 用户名: testuser, 密码: test123456');
    console.log('   登录地址: http://localhost:1420/login');
    console.log('   管理后台: http://localhost:1420/admin (仅管理员)');
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('❌ 创建管理员账号失败:', error);
    
    if (error.code === 'ENOTFOUND') {
      console.log('💡 网络连接问题，请检查：');
      console.log('   1. 网络连接是否正常');
      console.log('   2. MongoDB服务器是否可访问');
      console.log('   3. 防火墙设置是否阻止连接');
    } else if (error.code === 11000) {
      console.log('💡 用户名已存在，这是正常的');
    }
  } finally {
    if (client) {
      await client.close();
      console.log('📡 数据库连接已关闭');
    }
  }
}

// 检查MongoDB驱动是否安装
try {
  require('mongodb');
  createAdminAccount();
} catch (error) {
  console.log('❌ 请先安装MongoDB驱动:');
  console.log('npm install mongodb');
  console.log('然后重新运行此脚本');
}
