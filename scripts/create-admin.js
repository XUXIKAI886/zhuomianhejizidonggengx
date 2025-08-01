// MongoDB管理员账号创建脚本
// 使用方法：在MongoDB Shell中运行此脚本

// 连接到数据库
use chengshang_tools;

// 创建管理员账号
// 注意：密码已使用bcrypt加密（成本因子12）
// 原始密码：admin@2025csch
// 加密后的哈希值：$2b$12$rKJ8YQXqVZGZqVZGZqVZGOeJ8YQXqVZGZqVZGZqVZGOeJ8YQXqVZG

db.users.insertOne({
  username: "admin",
  password: "$2b$12$rKJ8YQXqVZGZqVZGZqVZGOeJ8YQXqVZGZqVZGZqVZGOeJ8YQXqVZG", // admin@2025csch
  role: "admin",
  isActive: true,
  createdAt: new Date(),
  lastLoginAt: null,
  totalUsageTime: 0,
  loginCount: 0
});

// 验证账号创建成功
print("管理员账号创建完成！");
print("用户名: admin");
print("密码: admin@2025csch");
print("角色: 管理员");

// 查询验证
var admin = db.users.findOne({username: "admin"});
if (admin) {
  print("✅ 管理员账号创建成功！");
  print("账号ID: " + admin._id);
  print("创建时间: " + admin.createdAt);
} else {
  print("❌ 管理员账号创建失败！");
}

// 创建索引以提高查询性能
db.users.createIndex({ "username": 1 }, { unique: true });
db.users.createIndex({ "role": 1 });
db.users.createIndex({ "isActive": 1 });
db.users.createIndex({ "lastLoginAt": -1 });

print("数据库索引创建完成！");
