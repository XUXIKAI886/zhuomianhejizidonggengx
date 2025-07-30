const semver = require('semver');

// 版本数据存储 (生产环境建议使用数据库)
const releases = {
  'windows-x86_64': [
    {
      version: '1.0.0',
      notes: '• 初始版本发布\n• 19个专业工具集成\n• 企业级安全保护\n• 完整的自动更新系统\n• 支持亮色和暗色主题',
      pub_date: '2024-01-30T10:00:00Z',
      signature: 'dW50cnVzdGVkIGNvbW1lbnQ6IHNpZ25hdHVyZSBmcm9tIHRhdXJpIHNlY3JldCBrZXkKUlVUNDJSNXU5VWZ4SGFuZGxlciBBcHBsaWNhdGlvbgpSV1NCQU8zdDA4anVKc2I2YTBGQVNBVnhzV3J1MjBJMXJhcEtnNm1RRUNBTGczZ1FBQVJZSTFNRVowNlNUYWVJcw==',
      url: 'https://github.com/XUXIKAI886/zhuomianhejizidonggengx/releases/download/v1.0.0/呈尚策划工具箱-1.0.0-setup.exe'
    }
  ]
};

module.exports = async (req, res) => {
  // 设置 CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { query } = req;
    const url = new URL(req.url, `http://${req.headers.host}`);
    const pathParts = url.pathname.split('/').filter(Boolean);
    
    console.log(`[${new Date().toISOString()}] 请求路径: ${url.pathname}, 方法: ${req.method}`);
    
    // 解析路径: /api/releases/target/version
    if (pathParts.length >= 4 && pathParts[0] === 'api' && pathParts[1] === 'releases') {
      const target = pathParts[2];
      const currentVersion = pathParts[3];
      
      return handleUpdateCheck(req, res, target, currentVersion);
    }
    
    // POST 请求处理新版本添加
    if (req.method === 'POST') {
      return handleAddRelease(req, res);
    }
    
    res.status(404).json({ 
      error: '接口不存在',
      message: '请使用正确的API端点',
      endpoints: {
        check_update: 'GET /api/releases/{target}/{version}',
        add_release: 'POST /api/releases',
        health: 'GET /health'
      },
      received_path: url.pathname
    });
    
  } catch (error) {
    console.error(`[${new Date().toISOString()}] API错误:`, error);
    res.status(500).json({ 
      error: '服务器内部错误',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

async function handleUpdateCheck(req, res, target, currentVersion) {
  console.log(`[${new Date().toISOString()}] 检查更新请求: ${target} v${currentVersion}`);
  
  // 获取目标平台的发布版本
  const platformReleases = releases[target];
  if (!platformReleases || platformReleases.length === 0) {
    console.log(`[${new Date().toISOString()}] 未找到平台 ${target} 的发布版本`);
    return res.json({
      version: currentVersion,
      notes: '',
      pub_date: null,
      platforms: {}
    });
  }
  
  try {
    // 查找最新版本
    const latestRelease = platformReleases
      .sort((a, b) => semver.compare(b.version, a.version))[0];
    
    // 版本比较
    if (semver.gt(latestRelease.version, currentVersion)) {
      // 有新版本可用
      const response = {
        version: latestRelease.version,
        notes: latestRelease.notes,
        pub_date: latestRelease.pub_date,
        platforms: {
          [target]: {
            signature: latestRelease.signature,
            url: latestRelease.url
          }
        }
      };
      
      console.log(`[${new Date().toISOString()}] 发现新版本: ${currentVersion} -> ${latestRelease.version}`);
      res.json(response);
    } else {
      // 已是最新版本
      console.log(`[${new Date().toISOString()}] 已是最新版本: ${currentVersion}`);
      res.json({
        version: currentVersion,
        notes: '',
        pub_date: null,
        platforms: {}
      });
    }
  } catch (versionError) {
    console.error(`[${new Date().toISOString()}] 版本比较错误:`, versionError);
    res.status(400).json({
      error: '版本格式错误',
      message: '请使用有效的语义化版本号 (如: 1.0.0)',
      current_version: currentVersion
    });
  }
}

async function handleAddRelease(req, res) {
  // 验证管理员权限
  const authHeader = req.headers.authorization;
  const adminToken = process.env.ADMIN_TOKEN;
  
  if (!authHeader || !authHeader.startsWith('Bearer ') || authHeader.slice(7) !== adminToken) {
    console.log(`[${new Date().toISOString()}] 未授权的版本添加请求`);
    return res.status(401).json({ 
      error: '未授权访问',
      message: '需要有效的管理员令牌'
    });
  }
  
  const { target, version, notes, signature, url } = req.body;
  
  if (!target || !version || !signature || !url) {
    return res.status(400).json({ 
      error: '缺少必要参数',
      required: ['target', 'version', 'signature', 'url'],
      received: Object.keys(req.body)
    });
  }
  
  // 验证版本号格式
  if (!semver.valid(version)) {
    return res.status(400).json({
      error: '无效的版本号格式',
      message: '版本号必须符合语义化版本规范 (如: 1.0.0)',
      received: version
    });
  }
  
  if (!releases[target]) {
    releases[target] = [];
  }
  
  // 检查版本是否已存在
  const existingVersion = releases[target].find(r => r.version === version);
  if (existingVersion) {
    return res.status(409).json({
      error: '版本已存在',
      message: `版本 ${version} 已经存在于 ${target} 平台`,
      existing_version: existingVersion
    });
  }
  
  const newRelease = {
    version,
    notes: notes || '',
    pub_date: new Date().toISOString(),
    signature,
    url
  };
  
  releases[target].push(newRelease);
  
  console.log(`[${new Date().toISOString()}] 新版本添加成功: ${target} v${version}`);
  res.json({ 
    success: true, 
    message: '版本添加成功',
    release: newRelease,
    total_releases: releases[target].length
  });
}