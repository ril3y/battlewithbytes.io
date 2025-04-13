/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  images: {
    unoptimized: true,
  },
  // Remove basePath and assetPrefix if using a custom domain root
  basePath: '', // Set to empty string
  assetPrefix: '', // Set to empty string
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
