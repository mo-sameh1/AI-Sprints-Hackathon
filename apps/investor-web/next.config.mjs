const operatorOrigin = process.env.OPERATOR_WEB_URL ?? 'http://localhost:3002';
const adminOrigin = process.env.ADMIN_WEB_URL ?? 'http://localhost:3001';

/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      { source: '/operator', destination: `${operatorOrigin}/operator` },
      { source: '/operator/:path*', destination: `${operatorOrigin}/operator/:path*` },
      { source: '/admin', destination: `${adminOrigin}/admin` },
      { source: '/admin/:path*', destination: `${adminOrigin}/admin/:path*` },
    ];
  },
};

export default nextConfig;
