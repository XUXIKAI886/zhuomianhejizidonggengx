# 静态文件更新服务器

## 目录结构
```
static-update-server/
├── windows-x86_64/
│   ├── 1.0.0.json    # 从v1.0.0检查的更新信息
│   ├── 1.1.0.json    # 从v1.1.0检查的更新信息
│   └── latest.json   # 最新版本信息
├── darwin-x86_64/   # macOS支持
├── linux-x86_64/    # Linux支持
└── nginx.conf        # Nginx配置示例
```

## 部署方式

### 使用CDN (推荐)
1. 将文件上传到阿里云OSS/腾讯云COS/AWS S3
2. 配置CDN加速域名
3. 更新Tauri配置中的endpoint地址

### 使用Nginx
```nginx
server {
    listen 443 ssl;
    server_name releases.chengshangcehua.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    root /var/www/update-server;
    
    location /api/releases/ {
        rewrite ^/api/releases/(.*)$ /$1.json last;
    }
    
    location ~ \.json$ {
        add_header Content-Type application/json;
        add_header Access-Control-Allow-Origin *;
    }
}
```

### 优点
- 部署简单，成本低
- CDN缓存，访问速度快
- 无需服务器运维

### 缺点
- 缺乏动态逻辑
- 版本管理需要手动维护