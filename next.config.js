/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';

// In production, don't use paths for custom domain
const isUsingCustomDomain = true; // Set to true since you're using battlewithbytes.io

const nextConfig = {
  output: 'export',
  // Only use basePath and assetPrefix if NOT using a custom domain and in production
  basePath: isProd && !isUsingCustomDomain ? '/battlewithbytes.io' : '',
  assetPrefix: isProd && !isUsingCustomDomain ? '/battlewithbytes.io/' : '',
  reactStrictMode: false,
  images: {
    unoptimized: true, // Stays true for static export compatibility
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.flux.ai',
        port: '',
        pathname: '/static/media/**',
      },
    ],
  },
  // Your other Next.js configurations can go here
};

module.exports = nextConfig;
