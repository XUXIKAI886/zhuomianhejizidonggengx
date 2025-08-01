// MongoDB数据库初始化脚本
// 创建管理员账号和必要的集合结构
// 使用方法：mongosh "mongodb://root:6scldk9f@dbconn.sealosbja.site:39056/?directConnection=true" --file scripts/init-mongodb.js

// 连接到数据库
use('chengshang_tools');

print('🚀 开始初始化呈尚策划工具箱数据库...');
print('='.repeat(60));

// 1. 创建管理员账号
print('📝 创建管理员账号...');

// 删除已存在的管理员账号（如果有）
db.users.deleteOne({username: "admin"});

// 插入新的管理员账号
// 密码：admin@2025csch (使用SHA256+盐值加密)
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

// 2. 创建测试用户账号
print('\n📝 创建测试用户账号...');

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

// 3. 创建数据库索引
print('\n📝 创建数据库索引...');

// users集合索引
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

// 4. 验证数据库状态
print('\n📊 验证数据库状态...');

const userCount = db.users.countDocuments();
const adminCount = db.users.countDocuments({role: "admin"});
const activeUserCount = db.users.countDocuments({isActive: true});

print('总用户数: ' + userCount);
print('管理员数: ' + adminCount);
print('活跃用户数: ' + activeUserCount);

// 5. 显示所有用户
print('\n👥 当前用户列表:');
print('-'.repeat(60));

db.users.find({}, {password: 0}).forEach(function(user) {
  print('用户名: ' + user.username + 
        ' | 角色: ' + user.role + 
        ' | 状态: ' + (user.isActive ? '启用' : '禁用') +
        ' | 创建时间: ' + user.createdAt.toISOString().split('T')[0]);
});

print('\n🎉 数据库初始化完成！');
print('='.repeat(60));
print('🔐 管理员登录信息:');
print('   用户名: admin');
print('   密码: admin@2025csch');
print('   访问地址: http://localhost:1420/login');
print('='.repeat(60));
