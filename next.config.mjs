/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // 移除过时的suppressHydrationWarning配置
  // 在Next.js 15中，hydration警告应该通过其他方式处理
}

export default nextConfig
