import withMDX from '@next/mdx'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'export',
  webpack: (config, options) => {
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
    return config
  },
}

export default withMDX()(nextConfig)
