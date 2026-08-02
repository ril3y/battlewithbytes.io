import nextConfig from "@battlewithbytes/eslint-config/next";

export default [
  {
    ignores: ["*.js", "*.mjs"],
  },
  ...nextConfig,
];
