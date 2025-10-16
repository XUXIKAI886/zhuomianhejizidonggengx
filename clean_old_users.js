const { MongoClient } = require('mongodb');

const uri = "mongodb://chengshang2025:chengshang2025@dbconn.sealosbja.site:39056/chengshang?authSource=chengshang";

async function cleanOldUsers() {
    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log("✅ 已连接到MongoDB数据库");

        const db = client.db("chengshang");
        const usersCollection = db.collection("users");

        // 查找所有用户
        const allUsers = await usersCollection.find({}).toArray();
        console.log(`\n📊 数据库中共有 ${allUsers.length} 个用户`);

        // 查找密码为空的用户
        const usersWithEmptyPassword = allUsers.filter(user => !user.password || user.password === "");
        console.log(`\n⚠️  发现 ${usersWithEmptyPassword.length} 个密码为空的用户:`);
        usersWithEmptyPassword.forEach(user => {
            console.log(`   - ${user.username} (ID: ${user._id})`);
        });

        if (usersWithEmptyPassword.length > 0) {
            console.log("\n🗑️  准备删除这些用户...");

            // 删除密码为空的用户
            const result = await usersCollection.deleteMany({
                $or: [
                    { password: { $exists: false } },
                    { password: "" },
                    { password: null }
                ]
            });

            console.log(`✅ 成功删除 ${result.deletedCount} 个密码为空的用户`);

            // 验证删除结果
            const remainingUsers = await usersCollection.find({}).toArray();
            console.log(`\n📊 清理后数据库中剩余 ${remainingUsers.length} 个用户:`);
            remainingUsers.forEach(user => {
                console.log(`   - ${user.username} (${user.role}) - 密码哈希: ${user.password ? '✅ 有密码' : '❌ 无密码'}`);
            });
        } else {
            console.log("\n✅ 所有用户都有密码,无需清理");
        }

    } catch (error) {
        console.error("❌ 错误:", error);
    } finally {
        await client.close();
    }
}

cleanOldUsers();
