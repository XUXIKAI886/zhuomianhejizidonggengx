const { MongoClient } = require('mongodb');

const uri = "mongodb://chengshang2025:chengshang2025@dbconn.sealosbja.site:39056/chengshang?authSource=chengshang";

async function checkUsers() {
    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log("✅ 已连接到MongoDB数据库");

        const db = client.db("chengshang");
        const usersCollection = db.collection("users");

        // 查找所有用户
        const allUsers = await usersCollection.find({}).toArray();
        console.log(`\n📊 数据库中共有 ${allUsers.length} 个用户\n`);

        allUsers.forEach((user, index) => {
            console.log(`${index + 1}. 用户名: ${user.username}`);
            console.log(`   角色: ${user.role}`);
            console.log(`   密码字段存在: ${user.password !== undefined ? '是' : '否'}`);
            console.log(`   密码值: ${user.password || '(空)'}`);
            console.log(`   密码长度: ${user.password ? user.password.length : 0}`);
            console.log(`   状态: ${user.isActive ? '激活' : '禁用'}`);
            console.log(`   ID: ${user._id}`);
            console.log('');
        });

    } catch (error) {
        console.error("❌ 错误:", error);
    } finally {
        await client.close();
    }
}

checkUsers();
