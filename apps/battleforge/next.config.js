/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: process.env.NODE_ENV === 'production' ? '/tools/battleforge' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/tools/battleforge' : '',
  reactStrictMode: false,
  images: {
    unoptimized: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
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

    // Transpile workspace packages
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': require('path').resolve(__dirname, './src'),
    };

    return config;
  },
};

module.exports = nextConfig;
