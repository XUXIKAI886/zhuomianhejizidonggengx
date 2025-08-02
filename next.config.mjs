/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // 确保CSS正确加载
  assetPrefix: '',
  basePath: '',
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // 配置webpack来处理浏览器环境
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // 确保Node.js模块不会被打包到客户端（除了我们需要的）
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
        // 移除 mongodb: false，允许在API路由中使用
      }
    }

    return config
  },
  // 移除过时的suppressHydrationWarning配置
  // 在Next.js 15中，hydration警告应该通过其他方式处理
}

export default nextConfig
