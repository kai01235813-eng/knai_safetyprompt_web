/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  // Python 통합을 위한 설정
  rewrites: async () => {
    return [
      {
        source: '/api/python/:path*',
        destination: '/api/python/:path*',
      },
    ];
  },
  // 이미지 최적화
  images: {
    domains: [],
    formats: ['image/webp'],
  },
  // 환경 변수
  env: {
    NEXT_PUBLIC_APP_NAME: 'KEPCO 프롬프트 보안 검증',
    NEXT_PUBLIC_APP_VERSION: '2.1.0',
  },
};

module.exports = nextConfig;
