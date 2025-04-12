/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost', '127.0.0.1'],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Disable webpack cache in development to prevent the errors
  webpack: (config, { dev }) => {
    if (dev) {
      // Reduce caching to prevent ENOENT errors
      config.cache = {
        type: 'memory',
      };
    }
    return config;
  },
  // Note: The cross-origin warning is just a warning about future versions
  // and doesn't affect functionality in the current version
};

module.exports = nextConfig;
