const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const semver = require('semver');

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());

// 版本数据存储 (生产环境建议使用数据库)
const releases = {
  'windows-x86_64': [
    {
      version: '1.0.0',
      notes: '• 初始版本发布\n• 19个专业工具集成\n• 企业级安全保护',
      pub_date: '2024-01-10T10:00:00Z',
      signature: 'dW50cnVzdGVkIGNvbW1lbnQ6IHNpZ25hdHVyZSBmcm9tIHRhdXJpIHNlY3JldCBrZXkKUlVUNDJSNXU5VWZ4...',
      url: 'https://releases.chengshangcehua.com/呈尚策划工具箱-1.0.0-setup.exe'
    },
    {
      version: '1.1.0',
      notes: '• 修复了工具启动异常问题\n• 优化了界面响应速度\n• 新增了使用统计功能',
      pub_date: '2024-01-15T12:00:00Z',
      signature: 'dW50cnVzdGVkIGNvbW1lbnQ6IHNpZ25hdHVyZSBmcm9tIHRhdXJpIHNlY3JldCBrZXkKUlVUNDJSNXU5VWZ4...',
      url: 'https://releases.chengshangcehua.com/呈尚策划工具箱-1.1.0-setup.exe'
    }
  ]
};

// 更新检查API
app.get('/api/releases/:target/:current_version', (req, res) => {
  try {
    const { target, current_version } = req.params;
    
    console.log(`检查更新请求: ${target} v${current_version}`);
    
    // 获取目标平台的发布版本
    const platformReleases = releases[target];
    if (!platformReleases || platformReleases.length === 0) {
      return res.json({
        version: current_version,
        notes: '',
        pub_date: null,
        platforms: {}
      });
    }
    
    // 查找最新版本
    const latestRelease = platformReleases
      .sort((a, b) => semver.compare(b.version, a.version))[0];
    
    // 版本比较
    if (semver.gt(latestRelease.version, current_version)) {
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
        version: current_version,
        notes: '',
        pub_date: null,
        platforms: {}
      });
    }
    
  } catch (error) {
    console.error('更新检查错误:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

// 健康检查
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: '呈尚策划工具箱更新服务'
  });
});

// 版本管理API (管理员使用)
app.post('/api/admin/releases', (req, res) => {
  // 这里应该添加管理员认证
  const { target, version, notes, signature, url } = req.body;
  
  if (!releases[target]) {
    releases[target] = [];
  }
  
  releases[target].push({
    version,
    notes,
    pub_date: new Date().toISOString(),
    signature,
    url
  });
  
  console.log(`新版本添加: ${target} v${version}`);
  res.json({ success: true, message: '版本添加成功' });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 呈尚策划工具箱更新服务器启动成功`);
  console.log(`📡 监听端口: ${PORT}`);
  console.log(`🔗 API地址: http://localhost:${PORT}/api/releases/{target}/{version}`);
  console.log(`💊 健康检查: http://localhost:${PORT}/health`);
});

module.exports = app;