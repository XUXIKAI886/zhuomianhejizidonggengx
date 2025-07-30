module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  
  const healthData = {
    status: 'ok',
    service: '呈尚策划工具箱更新服务',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    uptime: process.uptime(),
    platform: 'Vercel Serverless',
    region: process.env.VERCEL_REGION || 'unknown'
  };
  
  res.status(200).json(healthData);
};