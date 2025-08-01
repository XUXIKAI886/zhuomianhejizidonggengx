const semver = require('semver');

// 版本数据存储 (使用 Vercel KV 或外部数据库在生产环境)
const releases = {
  'windows-x86_64': [
    {
      version: '1.0.9',
      notes: '• 修复自动更新系统版本数据同步问题\n• 优化更新检查机制和错误处理\n• 提升系统稳定性和用户体验\n• 完善版本管理和发布流程',
      pub_date: '2025-07-31T08:00:00Z',
      signature: 'dW50cnVzdGVkIGNvbW1lbnQ6IHNpZ25hdHVyZSBmcm9tIHRhdXJpIHNlY3JldCBrZXkKUlVUNDJSNXU5VWZ4SGFuZGxlciBBcHBsaWNhdGlvbgpSV1NCQU8zdDA4anVKc2I2YTBGQVNBVnhzV3J1MjBJMXJhcEtnNm1RRUNBTGczZ1FBQVJZSTFNRVowNlNUYWVJcw==',
      url: 'https://github.com/XUXIKAI886/zhuomianhejizidonggengx/releases/download/v1.0.9/csch_1.0.9_x64-setup.exe'
    },
    {
      version: '1.0.8',
      notes: '• 强化调试版本，强制启用开发者工具\n• 禁用Web安全限制，确保调试功能正常\n• 强制启用日志插件，提供详细调试信息\n• 专门用于排查更新问题的强化调试版本',
      pub_date: '2025-07-30T12:00:00Z',
      signature: 'dW50cnVzdGVkIGNvbW1lbnQ6IHNpZ25hdHVyZSBmcm9tIHRhdXJpIHNlY3JldCBrZXkKUlVUNDJSNXU5VWZ4SGFuZGxlciBBcHBsaWNhdGlvbgpSV1NCQU8zdDA4anVKc2I2YTBGQVNBVnhzV3J1MjBJMXJhcEtnNm1RRUNBTGczZ1FBQVJZSTFNRVowNlNUYWVJcw==',
      url: 'https://github.com/XUXIKAI886/zhuomianhejizidonggengx/releases/download/v1.0.8/csch_1.0.8_x64-setup.exe'
    },
    {
      version: '1.0.7',
      notes: '• 临时启用开发者工具，便于排查自动更新问题\n• 增强调试日志输出，便于问题排查\n• 保持所有更新功能和环境检测逻辑\n• 临时调试版本，用于问题诊断',
      pub_date: '2025-07-30T11:00:00Z',
      signature: 'dW50cnVzdGVkIGNvbW1lbnQ6IHNpZ25hdHVyZSBmcm9tIHRhdXJpIHNlY3JldCBrZXkKUlVUNDJSNXU5VWZ4SGFuZGxlciBBcHBsaWNhdGlvbgpSV1NCQU8zdDA4anVKc2I2YTBGQVNBVnhzV3J1MjBJMXJhcEtnNm1RRUNBTGczZ1FBQVJZSTFNRVowNlNUYWVJcw==',
      url: 'https://github.com/XUXIKAI886/zhuomianhejizidonggengx/releases/download/v1.0.7/csch_1.0.7_x64-setup.exe'
    },
    {
      version: '1.0.6',
      notes: '• 更新服务器域名优化\n• 提升国内用户访问稳定性\n• 简化Tauri环境检测逻辑\n• 优化更新检查机制，减少误报',
      pub_date: '2025-07-30T10:00:00Z',
      signature: 'dW50cnVzdGVkIGNvbW1lbnQ6IHNpZ25hdHVyZSBmcm9tIHRhdXJpIHNlY3JldCBrZXkKUlVUNDJSNXU5VWZ4SGFuZGxlciBBcHBsaWNhdGlvbgpSV1NCQU8zdDA4anVKc2I2YTBGQVNBVnhzV3J1MjBJMXJhcEtnNm1RRUNBTGczZ1FBQVJZSTFNRVowNlNUYWVJcw==',
      url: 'https://github.com/XUXIKAI886/zhuomianhejizidonggengx/releases/download/v1.0.6/csch_1.0.6_x64-setup.exe'
    },
    {
      version: '1.0.5',
      notes: '• 更新检测机制优化\n• 优化Tauri环境检测逻辑\n• 增强错误处理和详细诊断日志\n• 改进用户体验和状态反馈',
      pub_date: '2025-07-30T09:00:00Z',
      signature: 'dW50cnVzdGVkIGNvbW1lbnQ6IHNpZ25hdHVyZSBmcm9tIHRhdXJpIHNlY3JldCBrZXkKUlVUNDJSNXU5VWZ4SGFuZGxlciBBcHBsaWNhdGlvbgpSV1NCQU8zdDA4anVKc2I2YTBGQVNBVnhzV3J1MjBJMXJhcEtnNm1RRUNBTGczZ1FBQVJZSTFNRVowNlNUYWVJcw==',
      url: 'https://github.com/XUXIKAI886/zhuomianhejizidonggengx/releases/download/v1.0.5/csch_1.0.5_x64-setup.exe'
    },
    {
      version: '1.0.0',
      notes: '• 初始版本发布\n• 19个专业工具集成\n• 企业级安全保护',
      pub_date: '2024-01-10T10:00:00Z',
      signature: 'dW50cnVzdGVkIGNvbW1lbnQ6IHNpZ25hdHVyZSBmcm9tIHRhdXJpIHNlY3JldCBrZXkKUlVUNDJSNXU5VWZ4SGFuZGxlciBBcHBsaWNhdGlvbgpSV1NCQU8zdDA4anVKc2I2YTBGQVNBVnhzV3J1MjBJMXJhcEtnNm1RRUNBTGczZ1FBQVJZSTFNRVowNlNUYWVJcw==',
      url: 'https://github.com/your-org/chengshang-tools/releases/download/v1.0.0/呈尚策划工具箱-1.0.0-setup.exe'
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
    
    res.status(404).json({ error: '接口不存在' });
    
  } catch (error) {
    console.error('API错误:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
};

async function handleUpdateCheck(req, res, target, currentVersion) {
  console.log(`检查更新请求: ${target} v${currentVersion}`);
  
  // 获取目标平台的发布版本
  const platformReleases = releases[target];
  if (!platformReleases || platformReleases.length === 0) {
    return res.json({
      version: currentVersion,
      notes: '',
      pub_date: null,
      platforms: {}
    });
  }
  
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
    
    console.log(`发现新版本: ${latestRelease.version}`);
    res.json(response);
  } else {
    // 已是最新版本
    console.log('已是最新版本');
    res.json({
      version: currentVersion,
      notes: '',
      pub_date: null,
      platforms: {}
    });
  }
}

async function handleAddRelease(req, res) {
  // 验证管理员权限
  const authHeader = req.headers.authorization;
  const adminToken = process.env.ADMIN_TOKEN;
  
  if (!authHeader || !authHeader.startsWith('Bearer ') || authHeader.slice(7) !== adminToken) {
    return res.status(401).json({ error: '未授权访问' });
  }
  
  const { target, version, notes, signature, url } = req.body;
  
  if (!target || !version || !signature || !url) {
    return res.status(400).json({ error: '缺少必要参数' });
  }
  
  if (!releases[target]) {
    releases[target] = [];
  }
  
  releases[target].push({
    version,
    notes: notes || '',
    pub_date: new Date().toISOString(),
    signature,
    url
  });
  
  console.log(`新版本添加: ${target} v${version}`);
  res.json({ success: true, message: '版本添加成功' });
}