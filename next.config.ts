import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
import { securityHeaders } from './src/lib/security/headers';

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  reactStrictMode: true,

  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      // {
      //   protocol: 'https',
      //   hostname: 'res.-.com',
      // },
    ],
  },

  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  poweredByHeader: false,

  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },

  async redirects() {
    return [
      {
        source: '/legal',
        destination: '/privacy-policy',
        permanent: true,
      },
      {
        source: '/supporto',
        destination: '/contatti',
        permanent: true,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
