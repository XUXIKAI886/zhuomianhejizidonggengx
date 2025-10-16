const { MongoClient } = require('mongodb');
const crypto = require('crypto');

const uri = 'mongodb://root:6scldk9f@dbconn.sealosbja.site:39056/?directConnection=true';
const client = new MongoClient(uri);

async function findTestUserByHash() {
  try {
    await client.connect();
    console.log('✅ 已连接到MongoDB数据库\n');

    // 生成testuser密码的哈希值 (password + salt 顺序)
    const password = 'test123456';
    const salt = 'chengshang2025';
    const passwordHash = crypto.createHash('sha256').update(password + salt).digest('hex');

    console.log('🔑 查找密码哈希:', passwordHash);
    console.log('-------------------------------------------\n');

    const db = client.db('chengshang_tools');
    const usersCollection = db.collection('users');

    // 1. 尝试通过用户名查找
    console.log('方法1: 通过用户名查找...');
    const userByName = await usersCollection.findOne({ username: 'testuser' });
    if (userByName) {
      console.log('✅ 通过用户名找到用户:');
      console.log('  用户名:', userByName.username);
      console.log('  角色:', userByName.role);
      console.log('  状态:', userByName.isActive ? '✅ 活跃' : '❌ 停用');
      console.log('  密码哈希:', userByName.password);
      console.log('  哈希匹配:', userByName.password === passwordHash ? '✅ 匹配' : '❌ 不匹配');
    } else {
      console.log('❌ 未通过用户名找到testuser\n');
    }

    // 2. 尝试通过密码哈希查找
    console.log('\n方法2: 通过密码哈希查找...');
    const userByHash = await usersCollection.findOne({ password: passwordHash });
    if (userByHash) {
      console.log('✅ 通过密码哈希找到用户:');
      console.log('  用户名:', userByHash.username);
      console.log('  角色:', userByHash.role);
      console.log('  状态:', userByHash.isActive ? '✅ 活跃' : '❌ 停用');
    } else {
      console.log('❌ 未通过密码哈希找到用户\n');
    }

    // 3. 列出所有用户的用户名和状态
    console.log('\n方法3: 列出所有用户...');
    const allUsers = await usersCollection.find({}).toArray();
    console.log(`\n📊 数据库中共有 ${allUsers.length} 个用户:\n`);

    allUsers.forEach((u, index) => {
      const status = u.isActive ? '✅' : '❌';
      console.log(`${index + 1}. ${status} ${u.username} (${u.role})`);
    });

  } catch (error) {
    console.error('❌ 操作失败:', error.message);
    console.error('错误详情:', error);
  } finally {
    await client.close();
    console.log('\n📦 数据库连接已关闭');
  }
}

findTestUserByHash();
