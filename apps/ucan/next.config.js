/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@battlewithbytes/tailwind-config"],
  output: "standalone",
};

module.exports = nextConfig;
