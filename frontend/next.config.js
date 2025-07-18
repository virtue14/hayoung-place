/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  eslint: {
    // 배포 시 ESLint 오류를 경고로 처리
    ignoreDuringBuilds: process.env.NODE_ENV === "production",
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  // 이미지 도메인 보안 설정
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // 개발 환경에서 API 프록시 설정
  async rewrites() {
    if (process.env.NODE_ENV === 'development') {
      return [
        {
          source: '/api/:path*',
          destination: 'https://virtue-project.info/api/:path*',
        },
      ];
    }
    return [];
  },
  
  // 카카오맵 스크립트를 위한 보안 설정
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: `
              default-src 'self';
              script-src 'self' 'unsafe-eval' 'unsafe-inline' https://dapi.kakao.com https://t1.daumcdn.net http://t1.daumcdn.net;
              script-src-elem 'self' 'unsafe-inline' https://dapi.kakao.com https://t1.daumcdn.net http://t1.daumcdn.net;
              img-src 'self' data: blob: https: http:;
              style-src 'self' 'unsafe-inline';
              font-src 'self';
              object-src 'self' data:;
              connect-src 'self' https://dapi.kakao.com http://localhost:5000 http://localhost:8080 https://virtue-project.info;
            `.replace(/\s+/g, ' ').trim()
          }
        ]
      }
    ]
  },
}

module.exports = nextConfig 