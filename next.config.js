/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // Added for static site generation
  reactStrictMode: false,
  images: {
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
