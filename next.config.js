/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  images: {
    unoptimized: true,
  },
  basePath: process.env.NODE_ENV === 'production' ? '/battlewithbytes.io' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/battlewithbytes.io/' : '',
  trailingSlash: true, // Helps with static export path handling
  // Disable webpack cache in development to prevent the errors
  webpack: (config, { dev }) => {
    if (dev) {
      config.cache = false;
    }
    return config;
  }
};

module.exports = nextConfig;
