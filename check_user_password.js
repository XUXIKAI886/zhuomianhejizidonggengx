const { MongoClient, ObjectId } = require('mongodb');

const uri = "mongodb://chengshang2025:chengshang2025@dbconn.sealosbja.site:39056/chengshang?authSource=chengshang";

async function checkUserPassword() {
    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log("✅ 已连接到MongoDB数据库");

        const db = client.db("chengshang");
        const usersCollection = db.collection("users");

        // 查询呈尚售后用户
        const user = await usersCollection.findOne({ username: "呈尚售后" });

        if (user) {
            console.log("\n=== 用户信息 ===");
            console.log("用户名:", user.username);
            console.log("用户ID:", user._id.toString());
            console.log("密码哈希:", user.password);
            console.log("角色:", user.role);
            console.log("状态:", user.is_active ? "激活" : "禁用");

            // 计算期望的哈希值
            const crypto = require('crypto');
            const testPassword = "cs2025sh";
            const salt = "chengshang2025";
            const hash = crypto.createHash('sha256');
            hash.update(testPassword);
            hash.update(salt);
            const expectedHash = hash.digest('hex');

            console.log("\n=== 密码验证 ===");
            console.log("测试密码:", testPassword);
            console.log("期望哈希:", expectedHash);
            console.log("实际哈希:", user.password);
            console.log("匹配结果:", expectedHash === user.password ? "✅ 匹配" : "❌ 不匹配");

        } else {
            console.log("❌ 未找到用户: 呈尚售后");
        }

    } catch (error) {
        console.error("❌ 错误:", error);
    } finally {
        await client.close();
    }
}

checkUserPassword();
