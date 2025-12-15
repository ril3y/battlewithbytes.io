/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: process.env.NODE_ENV === 'production' ? '/tools/wirewizard' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/tools/wirewizard' : '',
};

module.exports = nextConfig;
