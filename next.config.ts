import type { NextConfig } from 'next'
import withMDX from '@next/mdx' 

const nextConfig: NextConfig = {
  experimental: {
    appDir: true,
  },
  output: 'export',
}

export default withMDX()(nextConfig)
