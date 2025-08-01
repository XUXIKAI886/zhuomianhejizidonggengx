module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  
  const healthData = {
    status: 'ok',
    service: '呈尚策划工具箱自动更新服务',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    uptime: process.uptime(),
    platform: 'Vercel Serverless',
    region: process.env.VERCEL_REGION || 'unknown',
    memory: process.memoryUsage(),
    github_repo: 'https://github.com/XUXIKAI886/zhuomianhejizidonggengx',
    endpoints: {
      check_update: '/api/releases/{target}/{version}',
      add_release: 'POST /api/releases',
      health: '/health'
    }
  };
  
  console.log(`[${new Date().toISOString()}] 健康检查请求 - 状态: ${healthData.status}`);
  
  res.status(200).json(healthData);
};