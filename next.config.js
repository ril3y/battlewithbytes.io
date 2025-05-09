/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // Added for static site generation
  basePath: '/battlewithbytes.io', // Added for GitHub Pages deployment
  assetPrefix: '/battlewithbytes.io/', // Often used with basePath for assets
  reactStrictMode: false,
  images: {
    unoptimized: true, // Added for static export compatibility
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
