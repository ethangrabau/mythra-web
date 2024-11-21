// next.config.ts
import type { NextConfig } from 'next';

const config: NextConfig = {
  webpack: config => {
    config.externals.push({
      'utf-8-validate': 'commonjs utf-8-validate',
      bufferutil: 'commonjs bufferutil',
    });
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ibb.co',
        port: '',
        pathname: '/**',
      },
      // This is needed because ibb.co redirects to i.ibb.co
      {
        protocol: 'https',
        hostname: 'i.ibb.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  experimental: {
    instrumentationHook: true,
  } as any,
  async rewrites() {
    return [
      {
        source: '/api/socket',
        destination: '/api/socket/route',
      },
      {
        source: '/socket.io/:path*',
        destination: '/api/socket/:path*',
      },
    ];
  },
};

export default config;
