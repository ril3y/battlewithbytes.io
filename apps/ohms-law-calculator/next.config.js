/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: process.env.NODE_ENV === 'production' ? '/tools/ohms-law-calculator' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/tools/ohms-law-calculator' : '',
};

module.exports = nextConfig;
