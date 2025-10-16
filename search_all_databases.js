const { MongoClient } = require('mongodb');

const uri = 'mongodb://root:6scldk9f@dbconn.sealosbja.site:39056/?directConnection=true';
const client = new MongoClient(uri);

async function searchAllDatabases() {
  try {
    await client.connect();
    console.log('✅ 已连接到MongoDB数据库\n');

    const adminDb = client.db().admin();
    const dbs = await adminDb.listDatabases();

    console.log('🔍 搜索所有数据库中包含 "testuser" 的文档...\n');
    console.log('='.repeat(80));

    for (const dbInfo of dbs.databases) {
      const dbName = dbInfo.name;

      // 跳过系统数据库
      if (dbName === 'admin' || dbName === 'config' || dbName === 'local') {
        continue;
      }

      console.log(`\n📂 数据库: ${dbName}`);
      console.log('-'.repeat(80));

      const db = client.db(dbName);
      const collections = await db.listCollections().toArray();

      for (const collInfo of collections) {
        const collName = collInfo.name;
        const collection = db.collection(collName);

        try {
          // 获取集合中的文档总数
          const totalDocs = await collection.countDocuments();

          if (totalDocs === 0) {
            continue;
          }

          console.log(`\n  📋 集合: ${collName} (${totalDocs} 个文档)`);

          // 方法1: 搜索 username 字段
          const byUsername = await collection.find({ username: 'testuser' }).toArray();
          if (byUsername.length > 0) {
            console.log(`    ✅ 找到 username='testuser' 的文档 (${byUsername.length}个):`);
            byUsername.forEach(doc => {
              console.log('    ', JSON.stringify(doc, null, 2).split('\n').join('\n     '));
            });
          }

          // 方法2: 搜索任何包含 "testuser" 字符串的文档
          const allDocs = await collection.find({}).limit(1000).toArray();
          const matchingDocs = allDocs.filter(doc => {
            const docStr = JSON.stringify(doc).toLowerCase();
            return docStr.includes('testuser');
          });

          if (matchingDocs.length > 0 && byUsername.length === 0) {
            console.log(`    ⚠️  在其他字段中找到 "testuser" (${matchingDocs.length}个文档):`);
            matchingDocs.forEach(doc => {
              console.log('    ', JSON.stringify(doc, null, 2).split('\n').join('\n     '));
            });
          }

          // 方法3: 显示集合的前3个文档示例结构
          if (byUsername.length === 0 && matchingDocs.length === 0 && totalDocs > 0) {
            const sampleDocs = await collection.find({}).limit(3).toArray();
            console.log(`    ℹ️  集合结构示例:`);
            sampleDocs.forEach((doc, idx) => {
              const keys = Object.keys(doc);
              console.log(`      文档${idx + 1}: {${keys.join(', ')}}`);
            });
          }

        } catch (collError) {
          console.log(`    ❌ 查询集合失败: ${collError.message}`);
        }
      }
    }

    console.log('\n' + '='.repeat(80));
    console.log('🎯 搜索完成\n');

  } catch (error) {
    console.error('❌ 操作失败:', error.message);
    console.error('错误详情:', error);
  } finally {
    await client.close();
    console.log('📦 数据库连接已关闭');
  }
}

searchAllDatabases();
