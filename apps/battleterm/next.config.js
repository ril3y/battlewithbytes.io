/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: process.env.NODE_ENV === 'production' ? '/tools/battleterm' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/tools/battleterm' : '',
  transpilePackages: ['@battlewithbytes/battleterm'],
};

module.exports = nextConfig;
