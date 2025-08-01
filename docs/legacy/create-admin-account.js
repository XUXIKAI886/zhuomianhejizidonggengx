// MongoDB管理员账号创建脚本
// 直接在MongoDB Shell中运行此脚本
// 使用方法：mongosh "mongodb://root:6scldk9f@dbconn.sealosbja.site:39056/?directConnection=true" --file create-admin-account.js

// 连接到数据库
use chengshang_tools;

print('🚀 开始创建呈尚策划工具箱管理员账号...');
print('='.repeat(60));

// 删除已存在的账号（如果有）
db.users.deleteMany({username: {$in: ["admin", "testuser"]}});
print('✅ 清理已存在的账号');

// 创建管理员账号
const adminResult = db.users.insertOne({
  username: "admin",
  password: "fac998bc601b4f9d4f689c8ada57480ef7f7785791befe08b8c381e2e600af23", // admin@2025csch
  role: "admin",
  isActive: true,
  createdAt: new Date(),
  lastLoginAt: null,
  totalUsageTime: 0,
  loginCount: 0
});

if (adminResult.acknowledged) {
  print('✅ 管理员账号创建成功！');
  print('   用户名: admin');
  print('   密码: admin@2025csch');
  print('   角色: 管理员');
  print('   账号ID: ' + adminResult.insertedId);
} else {
  print('❌ 管理员账号创建失败！');
}

// 创建测试用户
const testUserResult = db.users.insertOne({
  username: "testuser",
  password: "4050e0b66331805d96b30cedb8dcd0b84e81d56c71084a9d7ee291caaf03a172", // test123456
  role: "user",
  isActive: true,
  createdAt: new Date(),
  lastLoginAt: null,
  totalUsageTime: 0,
  loginCount: 0
});

if (testUserResult.acknowledged) {
  print('✅ 测试用户创建成功！');
  print('   用户名: testuser');
  print('   密码: test123456');
  print('   角色: 普通用户');
} else {
  print('❌ 测试用户创建失败！');
}

// 创建数据库索引
print('\n📝 创建数据库索引...');
db.users.createIndex({ "username": 1 }, { unique: true });
db.users.createIndex({ "role": 1 });
db.users.createIndex({ "isActive": 1 });
db.users.createIndex({ "lastLoginAt": -1 });

// tool_usage集合索引
db.tool_usage.createIndex({ "userId": 1, "toolId": 1 }, { unique: true });
db.tool_usage.createIndex({ "toolId": 1 });
db.tool_usage.createIndex({ "lastUsedAt": -1 });

// user_sessions集合索引
db.user_sessions.createIndex({ "userId": 1 });
db.user_sessions.createIndex({ "loginAt": -1 });
db.user_sessions.createIndex({ "logoutAt": -1 });

print('✅ 数据库索引创建完成！');

// 验证创建结果
print('\n📊 验证数据库状态...');
const userCount = db.users.countDocuments();
const adminCount = db.users.countDocuments({role: "admin"});
const activeUserCount = db.users.countDocuments({isActive: true});

print('总用户数: ' + userCount);
print('管理员数: ' + adminCount);
print('活跃用户数: ' + activeUserCount);

// 显示所有用户
print('\n👥 当前用户列表:');
print('-'.repeat(60));
db.users.find({}, {password: 0}).forEach(function(user) {
  print('用户名: ' + user.username + 
        ' | 角色: ' + user.role + 
        ' | 状态: ' + (user.isActive ? '启用' : '禁用') +
        ' | 创建时间: ' + user.createdAt.toISOString().split('T')[0]);
});

print('\n🎉 管理员账号创建完成！');
print('='.repeat(60));
print('🔐 登录信息:');
print('   管理员 - 用户名: admin, 密码: admin@2025csch');
print('   测试用户 - 用户名: testuser, 密码: test123456');
print('   登录地址: http://localhost:1420/login');
print('   管理后台: http://localhost:1420/admin (仅管理员)');
print('='.repeat(60));
