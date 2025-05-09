/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';
// When using custom domain, we don't need basePath or assetPrefix
// If this is a GitHub Pages deployment without custom domain, we need them
const isCustomDomain = process.env.NEXT_PUBLIC_CUSTOM_DOMAIN === 'true';

const nextConfig = {
  output: 'export',
  basePath: isProd && !isCustomDomain ? '/battlewithbytes.io' : '',
  assetPrefix: isProd && !isCustomDomain ? '/battlewithbytes.io/' : '',
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
