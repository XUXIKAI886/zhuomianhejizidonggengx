const { MongoClient } = require('mongodb');

const uri = 'mongodb://root:6scldk9f@dbconn.sealosbja.site:39056/?directConnection=true';
const client = new MongoClient(uri);

async function findAndDisableTestUser() {
  try {
    await client.connect();
    console.log('✅ 已连接到MongoDB数据库\n');

    // 列出所有数据库
    const adminDb = client.db().admin();
    const dbs = await adminDb.listDatabases();

    console.log('📚 搜索所有数据库中的testuser用户...\n');

    for (const dbInfo of dbs.databases) {
      const dbName = dbInfo.name;
      if (dbName === 'admin' || dbName === 'config' || dbName === 'local') continue;

      console.log(`检查数据库: ${dbName}`);
      const db = client.db(dbName);
      const collections = await db.listCollections().toArray();

      for (const collInfo of collections) {
        const collName = collInfo.name;
        const collection = db.collection(collName);

        // 查找testuser
        const user = await collection.findOne({ username: 'testuser' });
        if (user) {
          console.log('\n🎯 找到testuser用户！');
          console.log('数据库:', dbName);
          console.log('集合:', collName);
          console.log('当前状态:', user.isActive ? '✅ 活跃' : '❌ 停用');
          console.log('角色:', user.role);
          console.log('-------------------------------------------\n');

          // 停用该用户
          const result = await collection.updateOne(
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
            console.log('用户名: testuser');
            console.log('新状态: ❌ 已停用 (isActive: false)');
            console.log('更新时间:', new Date().toLocaleString('zh-CN'));
          } else {
            console.log('ℹ️  用户状态未改变（可能已经是停用状态）');
          }

          await client.close();
          return;
        }
      }
    }

    console.log('\n❌ 在所有数据库中都未找到testuser用户');
    console.log('提示: 该用户可能使用不同的用户名或在其他MongoDB实例中');

  } catch (error) {
    console.error('❌ 操作失败:', error.message);
    console.error('错误详情:', error);
  } finally {
    await client.close();
    console.log('\n📦 数据库连接已关闭');
  }
}

findAndDisableTestUser();
