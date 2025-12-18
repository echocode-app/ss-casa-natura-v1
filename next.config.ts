import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,

  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      // CDN / Cloudinary
      // {
      //   protocol: 'https',
      //   hostname: 'res.cloudinary.com...',
      // },
    ],
  },

  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  poweredByHeader: false,
};

export default nextConfig;
