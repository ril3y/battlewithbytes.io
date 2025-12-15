/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: process.env.NODE_ENV === 'production' ? '/tools/mosfet-calculator' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/tools/mosfet-calculator' : '',
};

module.exports = nextConfig;
