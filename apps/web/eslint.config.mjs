import nextConfig from "@battlewithbytes/eslint-config/next";

export default [
  {
    // Plain CommonJS node scripts, not part of the typed app source
    ignores: ["scripts/**", ".claude/**"],
  },
  ...nextConfig,
];
