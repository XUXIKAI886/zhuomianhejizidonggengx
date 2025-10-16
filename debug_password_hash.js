const crypto = require('crypto');

// 密码哈希函数（与Rust代码相同的逻辑）
function hashPassword(password) {
    const salt = "chengshang2025";
    const hash = crypto.createHash('sha256');
    hash.update(password);
    hash.update(salt);
    return hash.digest('hex');
}

// 测试密码
const testPassword = "cs2025sh";  // 用户创建时输入的密码
const hashedPassword = hashPassword(testPassword);

console.log("=== 密码哈希调试 ===");
console.log("输入密码:", testPassword);
console.log("计算的哈希:", hashedPassword);
console.log("");

// 测试其他可能的密码
const possiblePasswords = [
    "cs2025sh",
    "Cs2025sh",
    "CS2025SH",
    "cs2025sh ",  // 带空格
    " cs2025sh",  // 前面带空格
];

console.log("测试可能的密码变体:");
possiblePasswords.forEach(pwd => {
    console.log(`密码: "${pwd}" => 哈希: ${hashPassword(pwd)}`);
});
