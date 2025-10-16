const { MongoClient } = require('mongodb');
const crypto = require('crypto');

const uri = 'mongodb://root:6scldk9f@dbconn.sealosbja.site:39056/?directConnection=true';
const client = new MongoClient(uri);

// 密码哈希函数 (与Rust后端一致: password + salt)
function hashPassword(password) {
  const salt = 'chengshang2025';
  return crypto.createHash('sha256').update(password + salt).digest('hex');
}

async function createAndDisableTestUser() {
  try {
    await client.connect();
    console.log('✅ 已连接到MongoDB数据库\n');

    const db = client.db('chengshang_tools');
    const usersCollection = db.collection('users');

    // 1. 检查testuser是否已存在
    console.log('🔍 检查testuser是否存在...');
    const existingUser = await usersCollection.findOne({ username: 'testuser' });

    if (existingUser) {
      console.log('⚠️  testuser已存在，直接更新为停用状态\n');

      const result = await usersCollection.updateOne(
        { username: 'testuser' },
        {
          $set: {
            isActive: false,
            updatedAt: new Date()
          }
        }
      );

      if (result.modifiedCount > 0) {
        console.log('✅ 成功停用testuser账号');
        console.log('   用户名: testuser');
        console.log('   状态: ❌ 已停用');
        console.log('   更新时间:', new Date().toLocaleString('zh-CN'));
      } else {
        console.log('ℹ️  testuser状态未改变(可能已经是停用状态)');
      }

    } else {
      console.log('❌ testuser不存在，创建并立即停用\n');

      // 2. 创建testuser账号(停用状态)
      const password = 'test123456';
      const passwordHash = hashPassword(password);

      const newUser = {
        username: 'testuser',
        password: passwordHash,
        role: 'user',
        isActive: false, // 创建时直接设置为停用状态
        createdAt: new Date(),
        lastLoginAt: null,
        totalUsageTime: 0,
        loginCount: 0,
        updatedAt: new Date()
      };

      const insertResult = await usersCollection.insertOne(newUser);

      if (insertResult.acknowledged) {
        console.log('✅ testuser账号创建成功并已停用');
        console.log('   用户名: testuser');
        console.log('   密码: test123456');
        console.log('   角色: 普通用户');
        console.log('   状态: ❌ 已停用(isActive: false)');
        console.log('   账号ID:', insertResult.insertedId);
        console.log('   密码哈希:', passwordHash);
        console.log('   创建时间:', new Date().toLocaleString('zh-CN'));
      } else {
        console.log('❌ testuser账号创建失败');
      }
    }

    // 3. 验证最终状态
    console.log('\n📊 验证testuser最终状态:');
    console.log('-'.repeat(60));

    const finalUser = await usersCollection.findOne({ username: 'testuser' });
    if (finalUser) {
      console.log('用户名:', finalUser.username);
      console.log('角色:', finalUser.role);
      console.log('状态:', finalUser.isActive ? '✅ 活跃' : '❌ 已停用');
      console.log('创建时间:', finalUser.createdAt.toLocaleString('zh-CN'));
      console.log('登录次数:', finalUser.loginCount);
      console.log('\n🎯 结果: testuser账号已成功停用，无法登录');
    }

  } catch (error) {
    console.error('❌ 操作失败:', error.message);
    console.error('错误详情:', error);
  } finally {
    await client.close();
    console.log('\n📦 数据库连接已关闭');
  }
}

createAndDisableTestUser();
