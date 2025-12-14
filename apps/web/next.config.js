/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';

// In production, don't use paths for custom domain
const isUsingCustomDomain = true; // Set to true since you're using battlewithbytes.io

const nextConfig = {
  output: 'export',
  eslint: {
    // Temporarily ignore eslint warnings during builds
    // These are pre-existing warnings that need cleanup later
    ignoreDuringBuilds: true,
  },
  // Only use basePath and assetPrefix if NOT using a custom domain and in production
  basePath: isProd && !isUsingCustomDomain ? '/battlewithbytes.io' : '',
  assetPrefix: isProd && !isUsingCustomDomain ? '/battlewithbytes.io/' : '',
  reactStrictMode: false,
  images: {
    unoptimized: true, // Stays true for static export compatibility
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.flux.ai',
        port: '',
        pathname: '/static/media/**',
      },
    ],
  },
  serverExternalPackages: ['@battlewithbytes/battlemagic-core', 'battlemagic-analyzer'],
  webpack: (config, { isServer }) => {
    // WASM support - enable for both client and server
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      syncWebAssembly: true,
      layers: true,
    };

    // Handle .wasm files
    config.module.rules.push({
      test: /\.wasm$/,
      type: 'webassembly/async',
    });

    if (!isServer) {
      // Ignore Node.js-specific modules when bundling for the browser
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };

      // Ensure WASM files are properly output for client
      config.output.webassemblyModuleFilename = 'static/wasm/[modulehash].wasm';
    }

    // Prevent WASM from being processed as asset
    config.module.rules.forEach(rule => {
      (rule.oneOf || []).forEach(oneOf => {
        if (oneOf.type === 'asset/resource') {
          oneOf.exclude = [
            ...(Array.isArray(oneOf.exclude) ? oneOf.exclude : [oneOf.exclude].filter(Boolean)),
            /\.wasm$/
          ];
        }
      });
    });

    return config;
  },
  // Your other Next.js configurations can go here
};

module.exports = nextConfig;
