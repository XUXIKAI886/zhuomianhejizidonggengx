const { MongoClient, ObjectId } = require('mongodb');
const crypto = require('crypto');

const uri = "mongodb://chengshang2025:chengshang2025@dbconn.sealosbja.site:39056/chengshang?authSource=chengshang";

// 密码哈希函数（与Rust代码相同的逻辑）
function hashPassword(password) {
    const salt = "chengshang2025";
    const hash = crypto.createHash('sha256');
    hash.update(password);
    hash.update(salt);
    return hash.digest('hex');
}

async function resetPassword() {
    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log("✅ 已连接到MongoDB数据库");

        const db = client.db("chengshang");
        const usersCollection = db.collection("users");

        // 新密码
        const newPassword = "cs2025sh";
        const hashedPassword = hashPassword(newPassword);

        console.log("\n=== 重置密码 ===");
        console.log("新密码:", newPassword);
        console.log("新密码哈希:", hashedPassword);

        // 更新密码
        const result = await usersCollection.updateOne(
            { username: "呈尚售后" },
            { $set: { password: hashedPassword } }
        );

        if (result.modifiedCount > 0) {
            console.log("✅ 密码已成功重置");

            // 验证更新
            const user = await usersCollection.findOne({ username: "呈尚售后" });
            console.log("\n=== 验证更新 ===");
            console.log("用户名:", user.username);
            console.log("数据库中的密码哈希:", user.password);
            console.log("匹配结果:", user.password === hashedPassword ? "✅ 匹配" : "❌ 不匹配");
        } else {
            console.log("❌ 密码重置失败");
        }

    } catch (error) {
        console.error("❌ 错误:", error);
    } finally {
        await client.close();
    }
}

resetPassword();
