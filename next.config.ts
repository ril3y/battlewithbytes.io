import type { NextConfig } from 'next'
import remarkGfm from 'remark-gfm'

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // Disable TypeScript checking during build
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  // Disable ESLint checking during build
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  webpack: (config, { dev, isServer }) => { 
    // Transpile react-console-emulator package
    config.module.rules.push({
      test: /\.js$/,
      include: /node_modules[\\/]react-console-emulator/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['next/babel']
        },
      },
    })
    
    // Disable webpack cache in development (merged from next.config.js)
    if (dev) {
      config.cache = false;
    }

    return config
  },
}

export default nextConfig
