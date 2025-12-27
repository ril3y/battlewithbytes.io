/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: process.env.NODE_ENV === 'production' ? '/tools/ucan' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/tools/ucan' : '',
  reactStrictMode: true,
  images: {
    unoptimized: true, // Required for static export compatibility
  },
  transpilePackages: ["@battlewithbytes/tailwind-config"],
};

module.exports = nextConfig;
