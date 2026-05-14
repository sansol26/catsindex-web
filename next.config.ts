import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        // 네이버 쇼핑 이미지 CDN
        protocol: 'https',
        hostname: 'shopping-phinf.pstatic.net',
      },
      {
        // 네이버 쇼핑 이미지 CDN (추가 도메인)
        protocol: 'https',
        hostname: '**.pstatic.net',
      },
      {
        // 쿠팡 이미지
        protocol: 'https',
        hostname: '**.coupangcdn.com',
      },
    ],
  },
};

export default nextConfig;
