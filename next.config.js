/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.externals.push({
      'utf-8-validate': 'commonjs utf-8-validate',
      'bufferutil': 'commonjs bufferutil',
    });
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3001',
        pathname: '/api/images/**',
      },
    ],
  },
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

export default nextConfig;